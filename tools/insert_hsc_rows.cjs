// Final step for the HSC MCQ batch: inserts tools/hsc_ready_to_insert.json
// straight into the live `questions` table. GOES LIVE TO STUDENTS IMMEDIATELY
// -- there is no draft/active gate in this app. Review tools/hsc_preview.html
// first.
//
// Usage: node --env-file=.env insert_hsc_rows.cjs <rows.json>
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (e.g. from the app\'s .env file) before running this script.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  const [, , rowsPath] = process.argv;
  if (!rowsPath) {
    console.error('Usage: node insert_hsc_rows.cjs <rows.json>');
    process.exit(1);
  }
  const rows = JSON.parse(fs.readFileSync(rowsPath, 'utf-8'));
  console.log(`Inserting ${rows.length} questions...`);
  const { data, error } = await supabase.from('questions').insert(rows).select('id');
  if (error) { console.error('Insert failed:', error); process.exitCode = 1; return; }
  console.log(`Inserted ${data.length} questions successfully.`);
})();
