const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Visitor = require('../models/Visitor');

async function assignSampleVisitorsToUser() {
  const emailArg = process.argv[2] || 'harman_demo@fastymtech.ae';
  const countArg = Number(process.argv[3] || 30);
  const count = Number.isFinite(countArg) && countArg > 0 ? Math.floor(countArg) : 30;

  try {
    await connectDB();

    const email = String(emailArg).trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User not found: ${email}`);
      process.exitCode = 1;
      return;
    }

    const sampleVisitors = await Visitor.find({
      remark: { $regex: '^Sample visitor record', $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(count)
      .select({ _id: 1 });

    if (sampleVisitors.length === 0) {
      console.log('No sample visitors found to assign.');
      return;
    }

    const ids = sampleVisitors.map((doc) => doc._id);
    const updateResult = await Visitor.updateMany(
      { _id: { $in: ids } },
      { $set: { userId: String(user._id) } }
    );

    console.log(`Assigned visitors: ${updateResult.modifiedCount}`);
    console.log(`Target user: ${email}`);
    console.log(`User ID: ${user._id}`);
  } catch (error) {
    console.error('Failed to assign sample visitors:', error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

assignSampleVisitorsToUser();
