// Stages the Additional Y11 batch (tools/additional_y11/paperN.json) for insert:
// uploads each referenced image (from the shared Extracted Images folder) to the
// question-images bucket once, then writes DB-ready rows to tools/pending_insert/.
// Does NOT touch the questions table.
//
// Usage: node --env-file=.env stage_additional_y11.cjs
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this script.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const IMG_DIR = path.join(__dirname, '..', 'HTML Exams', 'Year 12 Exams', 'Further Year 11 Papers', 'Extracted Images');
const SLUG = 'further-y11';

async function uploadImage(filename) {
  const localPath = path.join(IMG_DIR, filename);
  const buf = fs.readFileSync(localPath);
  const storagePath = `${SLUG}/${filename}`;
  const { error } = await supabase.storage.from('question-images').upload(storagePath, buf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`);
  const { data } = supabase.storage.from('question-images').getPublicUrl(storagePath);
  return data.publicUrl;
}

(async () => {
  const srcDir = path.join(__dirname, 'further_y11');
  const files = fs.readdirSync(srcDir).filter(f => /^paper\d+_(mc|section2)\.json$/.test(f));
  const outDir = path.join(__dirname, 'pending_insert');
  fs.mkdirSync(outDir, { recursive: true });

  const imageCache = {};
  let totalRows = 0;
  for (const f of files) {
    const questions = JSON.parse(fs.readFileSync(path.join(srcDir, f), 'utf-8'));
    const rows = [];
    for (const q of questions) {
      let imageUrl = '';
      if (q.image) {
        if (!imageCache[q.image]) {
          console.log('Uploading', q.image, '...');
          imageCache[q.image] = await uploadImage(q.image);
        }
        imageUrl = imageCache[q.image];
      }
      rows.push({
        module_id: q.module_id,
        inquiry_id: q.inquiry_id,
        type: q.type,
        prompt: q.prompt,
        image: imageUrl,
        options: q.options || null,
        bank: q.bank || null,
        pairs: q.pairs || null,
        items: q.items || null,
        answer: q.answer,
        hint: q.hint || null,
      });
    }
    const outName = 'further-y11-' + f.replace('.json', '') + '.json';
    fs.writeFileSync(path.join(outDir, outName), JSON.stringify(rows, null, 2));
    console.log(`Staged ${rows.length} rows -> pending_insert/${outName}`);
    totalRows += rows.length;
  }
  console.log(`Done. Total rows: ${totalRows}. Unique images uploaded: ${Object.keys(imageCache).length}`);
})();
