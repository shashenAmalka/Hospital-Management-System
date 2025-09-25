const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const PharmacyItem = require('./Model/PharmacyItemModel');
const PharmacyDispense = require('./Model/PharmacyDispenseModel');

const DEFAULT_ATLAS_URI = 'mongodb+srv://nadeera11:9KhpfPfStDvzr0Qk@cluster0.dyzuhhs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/helamedmy';

const START_YEAR = 2023;
const END_YEAR = 2025;
const MAX_RECORDS_PER_ITEM = 3;
const MAX_ITEMS_PER_CATEGORY = 5;

const reasonTemplates = [
  'Monthly dispensing - inpatient needs',
  'Outpatient prescriptions fulfillment',
  'Emergency stock usage',
  'Routine ward distribution',
  'Special clinic allocation'
];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandomReason = () => reasonTemplates[getRandomInt(0, reasonTemplates.length - 1)];

const buildDispenseRecord = (item, year, month, latestDay) => {
  const daysInMonth = latestDay || new Date(year, month + 1, 0).getDate();
  const day = getRandomInt(1, daysInMonth);
  const hour = getRandomInt(8, 20);
  const minute = getRandomInt(0, 59);

  const quantity = Math.max(1, getRandomInt(Math.ceil(item.minRequired * 0.5), Math.max(item.minRequired, item.quantity || item.minRequired)));

  return {
    item: item._id,
    quantity,
    reason: pickRandomReason(),
    dispensedAt: new Date(year, month, day, hour, minute),
    itemSnapshot: {
      itemId: item.itemId || item._id.toString(),
      name: item.name,
      category: item.category,
      unitPrice: item.unitPrice
    }
  };
};

const seedMonth = async (itemsByCategory, year, month, isCurrentMonth) => {
  const periodStart = new Date(year, month, 1);
  const periodEnd = new Date(year, month + 1, 1);

  const existingCount = await PharmacyDispense.countDocuments({
    dispensedAt: { $gte: periodStart, $lt: periodEnd }
  });

  if (existingCount > 0) {
    console.log(`⚠️  Skipping ${periodStart.toLocaleString('default', { month: 'long' })} ${year} (already has ${existingCount} records)`);
    return { month, inserted: 0, skipped: true };
  }

  const records = [];
  const latestDay = isCurrentMonth ? new Date().getDate() : null;

  Object.entries(itemsByCategory).forEach(([category, items]) => {
    if (!Array.isArray(items) || items.length === 0) {
      console.log(`ℹ️  No items found for category '${category}' — skipping for this month.`);
      return;
    }

    const itemsToUse = items.slice(0, MAX_ITEMS_PER_CATEGORY);

    itemsToUse.forEach((item) => {
      const recordCount = getRandomInt(1, MAX_RECORDS_PER_ITEM);
      for (let i = 0; i < recordCount; i += 1) {
        records.push(buildDispenseRecord(item, year, month, latestDay));
      }
    });
  });

  if (records.length === 0) {
    console.log(`⚠️  No dispense records generated for ${periodStart.toLocaleString('default', { month: 'long' })} ${year}.`);
    return { month, inserted: 0, skipped: false };
  }

  await PharmacyDispense.insertMany(records);
  console.log(`✅ Inserted ${records.length} dispense records for ${periodStart.toLocaleString('default', { month: 'long' })} ${year}.`);

  return { month, inserted: records.length, skipped: false };
};

const run = async () => {
  const mongoUri = process.env.MONGO_URI || DEFAULT_ATLAS_URI;

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');
  } catch (atlasError) {
    console.warn('⚠️  Atlas connection failed, trying local MongoDB...', atlasError.message);
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Connected to local MongoDB');
  }

  try {
    const items = await PharmacyItem.find().sort({ category: 1, name: 1 });
    if (!items.length) {
      console.warn('⚠️  No pharmacy items found. Seed pharmacy items before running this script.');
      return;
    }

    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (START_YEAR > currentYear) {
      console.warn(`⚠️  Start year ${START_YEAR} is in the future. Adjust START_YEAR before running.`);
      return;
    }

    const effectiveStartYear = Math.max(START_YEAR, currentYear - 10); // safety to avoid accidental huge seeds
    const effectiveEndYear = Math.min(Math.max(END_YEAR, START_YEAR), currentYear);

    if (effectiveStartYear > effectiveEndYear) {
      console.warn('⚠️  Effective start year is greater than end year. Nothing to seed.');
      return;
    }

    const summary = [];

    for (let year = effectiveStartYear; year <= effectiveEndYear; year += 1) {
      const lastMonth = year === currentYear ? currentMonth : 11;
      const yearResults = [];

      console.log(`\n📅 Seeding dispense records for ${year}...`);
      for (let month = 0; month <= lastMonth; month += 1) {
        const result = await seedMonth(
          itemsByCategory,
          year,
          month,
          year === currentYear && month === currentMonth
        );
        yearResults.push(result);
      }

      const yearInserted = yearResults.reduce((sum, r) => sum + (r?.inserted || 0), 0);
      const yearSkipped = yearResults.filter(r => r?.skipped).length;

      summary.push({
        year,
        inserted: yearInserted,
        skippedMonths: yearSkipped,
        processedMonths: yearResults.length
      });

      console.log(`📊 Year ${year} summary: inserted ${yearInserted}, skipped ${yearSkipped} months, processed ${yearResults.length} months.`);
    }

    const totalInserted = summary.reduce((sum, entry) => sum + entry.inserted, 0);
    const totalSkipped = summary.reduce((sum, entry) => sum + entry.skippedMonths, 0);
    const totalMonths = summary.reduce((sum, entry) => sum + entry.processedMonths, 0);

    console.log('\n🎯 Overall seeding summary');
    console.log(`   • Years processed: ${summary.length}`);
    console.log(`   • Total records inserted: ${totalInserted}`);
    console.log(`   • Total months skipped (already populated): ${totalSkipped}`);
    console.log(`   • Total months processed: ${totalMonths}`);
  } catch (error) {
    console.error('❌ An error occurred while seeding pharmacy dispenses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

run();
