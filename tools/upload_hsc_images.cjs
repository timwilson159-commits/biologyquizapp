// Prep step for the HSC MCQ pipeline: uploads each unique referenced image to
// the same `question-images` Supabase storage bucket insert_questions.cjs
// uses, and writes out the final DB-ready rows (module_id/inquiry_id/type/
// prompt/image URL/options/bank/pairs/items/answer/hint) -- WITHOUT touching
// the `questions` table itself. Nothing becomes visible to students until a
// separate insert step runs tomorrow.
//
// Usage: node upload_hsc_images.cjs <confirmed.json> <out_rows.json>
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
  const [, , questionsPath, outPath] = process.argv;
  if (!questionsPath || !outPath) {
    console.error('Usage: node upload_hsc_images.cjs <confirmed.json> <out_rows.json>');
    process.exit(1);
  }
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  const imageCache = {};
  const rows = [];
  for (const q of questions) {
    const examFolder = q.exam_folder;
    const examSlug = q.exam_slug;
    const imgName = q.image_filename || q.image || null;
    let imageUrl = '';
    if (imgName) {
      const cacheKey = `${examSlug}/${imgName}`;
      if (!imageCache[cacheKey]) {
        console.log('Uploading', cacheKey, '...');
        imageCache[cacheKey] = await uploadImage(examFolder, examSlug, imgName);
      }
      imageUrl = imageCache[cacheKey];
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

  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} ready-to-insert rows to ${outPath}`);
  console.log('Unique images uploaded:', Object.keys(imageCache).length);
})();
