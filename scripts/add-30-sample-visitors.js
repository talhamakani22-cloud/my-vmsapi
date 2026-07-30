const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Visitor = require('../models/Visitor');

const FIRST_NAMES = [
  'Ahmed', 'Fatima', 'Omar', 'Mariam', 'Khalid', 'Noora', 'Saeed', 'Aisha', 'Yousef', 'Huda',
  'Rashid', 'Salma', 'Zayed', 'Leila', 'Tariq', 'Reem', 'Faisal', 'Nadia', 'Hamad', 'Amal',
];

const LAST_NAMES = [
  'Al Mansoori', 'Al Nuaimi', 'Al Mazrouei', 'Al Falasi', 'Al Suwaidi',
  'Al Dhaheri', 'Al Qasimi', 'Al Shamsi', 'Al Ketbi', 'Al Yammahi',
];

const NATIONALITIES = ['UAE', 'India', 'Pakistan', 'Philippines', 'Egypt', 'Jordan', 'Oman'];
const PURPOSES = ['Meeting', 'Delivery', 'Maintenance', 'Interview', 'Inspection', 'Consultation'];
const GENDERS = ['Male', 'Female'];

function pad(num, size) {
  return String(num).padStart(size, '0');
}

function randomFrom(list, index) {
  return list[index % list.length];
}

function makeDate(year, month, day) {
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`;
}

function buildVisitor(index, runOffset, runToken) {
  const serial = 1000000 + runOffset + index;
  const birthYear = 1985 + (index % 15);
  const birthMonth = (index % 12) + 1;
  const birthDay = ((index * 3) % 28) + 1;
  const issueYear = 2024 + (index % 2);
  const issueMonth = ((index + 4) % 12) + 1;
  const issueDay = ((index * 2) % 28) + 1;
  const expiryYear = issueYear + 10;
  const gender = randomFrom(GENDERS, index);
  const first = randomFrom(FIRST_NAMES, index);
  const last = randomFrom(LAST_NAMES, index);
  const fullNameEnglish = `${first} ${last}`;

  return {
    visitorId: `VIS${pad(runOffset + index + 1, 5)}`,
    emiratesId: `784-19${90 + ((runOffset + index) % 10)}-${serial}-${(runOffset + index) % 10}`,
    fullNameEnglish,
    fullNameArabic: '',
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s+/g, '')}${runOffset + index + 1}@example.com`,
    phone: `05${pad(10000000 + runOffset + index, 8)}`,
    nationality: randomFrom(NATIONALITIES, index),
    dateOfBirth: makeDate(birthYear, birthMonth, birthDay),
    gender,
    issueDate: makeDate(issueYear, issueMonth, issueDay),
    expiryDate: makeDate(expiryYear, issueMonth, issueDay),
    purposeOfVisit: randomFrom(PURPOSES, index),
    visitDate: new Date().toISOString().split('T')[0],
    occupation: index % 3 === 0 ? 'Engineer' : index % 3 === 1 ? 'Manager' : 'Consultant',
    employer: `Company ${index + 1}`,
    remark: `Sample visitor record ${index + 1} (${runToken})`,
  };
}

async function addSampleVisitors() {
  try {
    await connectDB();

    const desiredCount = 30;
    const runToken = `seed-${Date.now()}`;
    const existingCount = await Visitor.countDocuments();
    let insertedCount = 0;

    for (let i = 0; i < desiredCount; i += 1) {
      const payload = buildVisitor(i, existingCount, runToken);
      try {
        await Visitor.create(payload);
        insertedCount += 1;
      } catch (error) {
        console.log(`Skipped record ${i + 1}: ${error.message}`);
      }
    }

    console.log(`Inserted sample visitors: ${insertedCount}`);
  } catch (error) {
    console.error('Failed to insert sample visitors:', error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

addSampleVisitors();
