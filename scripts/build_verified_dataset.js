import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function buildDataset() {
  const buf = fs.readFileSync('public/assets/aistudio/Healthcare_Patient_Analytics_Dataset_88a2c6b3.pdf');
  const parser = new PDFParse(new Uint8Array(buf));
  await parser.load();
  const res = await parser.getText();

  console.log('Total pages:', res.pages.length);

  // Helper to get lines from a page
  function getLines(pageIndex) {
    const text = res.pages[pageIndex].text || '';
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }

  // Part 1: Pages 0..20
  const part1 = [];
  for (let i = 0; i <= 20; i++) {
    const lines = getLines(i);
    for (const line of lines) {
      if (line.startsWith('Patient ID')) continue;
      // Format: P0408 53 Female Neurology OPD Not Admitted
      // or: P0863 36 Male Dermatology OPD Admitted
      // Regex parse
      const m = line.match(/^(P\d+)\s+(\d+)\s+(Male|Female)\s+(.+?)\s+(OPD|IPD)\s+(Admitted|Not Admitted)$/);
      if (m) {
        part1.push({
          patientId: m[1],
          age: parseInt(m[2], 10),
          gender: m[3],
          department: m[4].trim(),
          visitType: m[5],
          admissionStatus: m[6]
        });
      } else {
        console.error(`Part 1 regex failed on line: "${line}" on page ${i + 1}`);
      }
    }
  }

  // Part 2: Pages 21..41
  const part2 = [];
  for (let i = 21; i <= 41; i++) {
    const lines = getLines(i);
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (line.startsWith('Diagnosis')) continue;
      // Some lines might have length of stay on next line if wrapped, or on same line:
      // "Headache Dr. Joshi 3,902 0" or "Headache Dr. Deshmukh 5,915\n0"
      // Let's handle both!
      let combined = line;
      let m = combined.match(/^(.+?)\s+(Dr\.\s+[A-Za-z]+)\s+([0-9,]+)\s+(\d+)$/);
      if (!m && j + 1 < lines.length && /^\d+$/.test(lines[j + 1])) {
        combined = line + ' ' + lines[j + 1];
        j++;
        m = combined.match(/^(.+?)\s+(Dr\.\s+[A-Za-z]+)\s+([0-9,]+)\s+(\d+)$/);
      }
      if (m) {
        part2.push({
          diagnosis: m[1].trim(),
          doctor: m[2].trim(),
          treatmentCost: parseInt(m[3].replace(/,/g, ''), 10),
          lengthOfStay: parseInt(m[4], 10)
        });
      } else {
        console.error(`Part 2 regex failed on line: "${line}" on page ${i + 1}`);
      }
    }
  }

  // Part 3: Pages 42..62
  const part3 = [];
  for (let i = 42; i <= 62; i++) {
    const lines = getLines(i);
    for (const line of lines) {
      if (line.startsWith('Payment Mode')) continue;
      // Format: Insurance 02-01-2025 or Credit Card 02-01-2025 or UPI 02-01-2025 or Cash 03-01-2025
      const m = line.match(/^(Insurance|Credit Card|Cash|UPI)\s+(\d{2}-\d{2}-\d{4})$/);
      if (m) {
        part3.push({
          paymentMode: m[1],
          visitDateRaw: m[2]
        });
      } else {
        console.error(`Part 3 regex failed on line: "${line}" on page ${i + 1}`);
      }
    }
  }

  console.log(`Extracted counts: Part1=${part1.length}, Part2=${part2.length}, Part3=${part3.length}`);

  if (part1.length !== 1000 || part2.length !== 1000 || part3.length !== 1000) {
    throw new Error('Count mismatch! Expected 1000 rows for each part.');
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Combine rows
  const fullDataset = [];
  for (let i = 0; i < 1000; i++) {
    const p1 = part1[i];
    const p2 = part2[i];
    const p3 = part3[i];

    // parse DD-MM-YYYY
    const [day, monthStr, year] = p3.visitDateRaw.split('-');
    const monthNum = parseInt(monthStr, 10);
    const monthName = months[monthNum - 1];
    const isoDate = `${year}-${monthStr}-${day}`;

    // age group: 0-18, 19-35, 36-50, 51-65, 66+
    let ageGroup = '66+';
    if (p1.age <= 18) ageGroup = '0-18';
    else if (p1.age <= 35) ageGroup = '19-35';
    else if (p1.age <= 50) ageGroup = '36-50';
    else if (p1.age <= 65) ageGroup = '51-65';

    fullDataset.push({
      patientId: p1.patientId,
      age: p1.age,
      gender: p1.gender,
      department: p1.department,
      visitType: p1.visitType,
      admissionStatus: p1.admissionStatus,
      diagnosis: p2.diagnosis,
      doctor: p2.doctor,
      treatmentCost: p2.treatmentCost,
      lengthOfStay: p2.lengthOfStay,
      paymentMode: p3.paymentMode,
      visitDate: isoDate,
      visitDateDisplay: p3.visitDateRaw,
      month: monthName,
      monthIndex: monthNum,
      ageGroup
    });
  }

  // Verification calculations
  const totalCost = fullDataset.reduce((s, r) => s + r.treatmentCost, 0);
  const totalAdmissions = fullDataset.filter(r => r.admissionStatus === 'Admitted').length;
  const totalStay = fullDataset.reduce((s, r) => s + r.lengthOfStay, 0);
  const avgStay = totalStay / fullDataset.length;
  const avgCost = totalCost / fullDataset.length;

  console.log('--- VERIFICATION CHECKS ---');
  console.log('Total Patients:', fullDataset.length, '(Expected 1000)');
  console.log('Total Admissions:', totalAdmissions, '(Expected 287)');
  console.log('Total Treatment Cost:', totalCost, '(Expected 15221509)');
  console.log('Avg Treatment Cost:', Math.round(avgCost), '(Expected 15222)');
  console.log('Avg Length of Stay:', avgStay.toFixed(2), '(Expected 2.22)');

  // Department counts
  const deptCounts = {};
  const deptCosts = {};
  for (const r of fullDataset) {
    deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
    deptCosts[r.department] = (deptCosts[r.department] || 0) + r.treatmentCost;
  }
  console.log('Department Counts:', deptCounts);
  console.log('Department Costs:', deptCosts);

  // Age group counts
  const ageGroupCounts = {};
  for (const r of fullDataset) {
    ageGroupCounts[r.ageGroup] = (ageGroupCounts[r.ageGroup] || 0) + 1;
  }
  console.log('Age Group Counts:', ageGroupCounts);

  // Payment mode costs
  const payCosts = {};
  for (const r of fullDataset) {
    payCosts[r.paymentMode] = (payCosts[r.paymentMode] || 0) + r.treatmentCost;
  }
  console.log('Payment Mode Costs:', payCosts);

  // Save to JSON
  fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/healthcareData.json', JSON.stringify(fullDataset, null, 2));
  console.log('Saved src/data/healthcareData.json successfully!');
}

buildDataset().catch(console.error);
