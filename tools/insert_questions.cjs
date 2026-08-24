// Usage: node insert_questions.cjs <confirmed_questions.json> <examFolder> <examSlug>
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (e.g. from the app\'s .env file) before running this script.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function moduleIdFor(inquiryId) {
  return `module-${inquiryId.split('.')[0]}`;
}

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' };

async function uploadImage(examFolder, examSlug, filename) {
  const localPath = path.join(examFolder, filename);
  const buf = fs.readFileSync(localPath);
  const storagePath = `${examSlug}/${filename}`;
  const ext = path.extname(filename).toLowerCase();
  const { error } = await supabase.storage.from('question-images').upload(storagePath, buf, {
    contentType: MIME[ext] || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`);
  const { data } = supabase.storage.from('question-images').getPublicUrl(storagePath);
  return data.publicUrl;
}

(async () => {
  const [, , questionsPath, examFolder, examSlug] = process.argv;
  if (!questionsPath || !examFolder || !examSlug) {
    console.error('Usage: node insert_questions.cjs <confirmed_questions.json> <examFolder> <examSlug>');
    process.exit(1);
  }
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  const imageCache = {};
  const rows = [];
  for (const q of questions) {
    const imgName = q.image_filename || q.image || null;
    let imageUrl = '';
    if (imgName) {
      if (!imageCache[imgName]) {
        console.log('Uploading', imgName, '...');
        imageCache[imgName] = await uploadImage(examFolder, examSlug, imgName);
      }
      imageUrl = imageCache[imgName];
    }
    rows.push({
      module_id: moduleIdFor(q.inquiry_id),
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

  console.log(`Inserting ${rows.length} questions...`);
  const { data, error } = await supabase.from('questions').insert(rows).select('id');
  if (error) { console.error('Insert failed:', error); process.exitCode = 1; return; }
  console.log(`Inserted ${data.length} questions successfully.`);
  console.log('Unique images uploaded:', Object.keys(imageCache).length);
})();
