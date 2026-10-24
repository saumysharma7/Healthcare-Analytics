import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const pdf = require('pdf-parse');

async function main() {
  const dataBuffer = fs.readFileSync('public/assets/aistudio/Healthcare_Patient_Analytics_Dataset_88a2c6b3.pdf');
  const data = await pdf(dataBuffer);
  console.log('Total pages parsed:', data.numpages);
  console.log('Sample text (first 500 chars):');
  console.log(data.text.slice(0, 500));

  fs.writeFileSync('scripts/extracted_raw.txt', data.text);
  console.log('Wrote scripts/extracted_raw.txt, length:', data.text.length);
}

main().catch(console.error);
