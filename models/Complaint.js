const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    ticket: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: 'registered',
      trim: true,
      lowercase: true,
    },
    followUpNote: {
      type: String,
      default: 'Complaint registered',
      trim: true,
    },
    assignedTo: {
      type: String,
      default: '',
      trim: true,
    },
    imagePath: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
