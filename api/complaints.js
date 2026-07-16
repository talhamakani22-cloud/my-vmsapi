const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const Complaint = require('../models/Complaint');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'assets', 'images', 'complaints');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file || !file.mimetype) return callback(null, true);
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) return callback(null, true);
    return callback(new Error('Only JPG and PNG images are allowed.'));
  },
});

const ALLOWED_STATUSES = new Set([
  'registered',
  'assigned',
  'in progress',
  'pending',
  'resolved',
  'closed',
]);

async function ensureStorage() {
  await fs.mkdir(uploadsDir, { recursive: true });
}

async function buildTicketNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${d}`;

  const todayCount = await Complaint.countDocuments({
    ticket: { $regex: `^CMP-${datePart}-` },
  });

  const sequence = String(todayCount + 1).padStart(4, '0');
  return `CMP-${datePart}-${sequence}`;
}

router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load complaints.' });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    await ensureStorage();
    const { name = '', email = '', phone = '', location = '', details = '' } = req.body || {};

    if (!name.trim() || !email.trim() || !location.trim() || !details.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email, location, and details are required.' });
    }

    const ticket = await buildTicketNumber();
    let imagePath = '';

    if (req.file && req.file.buffer) {
      const ext = req.file.mimetype === 'image/png' ? '.png' : '.jpg';
      const safeTicket = ticket.replace(/[^A-Z0-9-]/gi, '_');
      const filename = `${safeTicket}${ext}`;
      const absoluteImagePath = path.join(uploadsDir, filename);
      await fs.writeFile(absoluteImagePath, req.file.buffer);
      imagePath = `/assets/images/complaints/${filename}`;
    }

    const complaint = await Complaint.create({
      ticket,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      details: details.trim(),
      status: 'registered',
      followUpNote: 'Complaint registered',
      assignedTo: '',
      imagePath,
    });

    return res.status(201).json({
      success: true,
      ticket,
      complaint: complaint.toObject(),
      message: 'Complaint submitted successfully.',
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate complaint ticket detected. Please try again.' });
    }
    if (error && error.message && error.message.includes('Only JPG and PNG')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Unable to submit complaint right now.' });
  }
});

router.patch('/:ticket', async (req, res) => {
  try {
    const ticketParam = String(req.params.ticket || '').trim().toUpperCase();
    const complaint = await Complaint.findOne({ ticket: ticketParam });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const { status, assignedTo, followUpNote } = req.body || {};

    if (typeof status === 'string' && status.trim()) {
      const normalizedStatus = status.trim().toLowerCase();
      if (!ALLOWED_STATUSES.has(normalizedStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid complaint status.' });
      }
      complaint.status = normalizedStatus;
    }

    if (typeof assignedTo === 'string') {
      complaint.assignedTo = assignedTo.trim();
    }

    if (typeof followUpNote === 'string') {
      complaint.followUpNote = followUpNote.trim();
    }

    await complaint.save();

    return res.json({ success: true, complaint: complaint.toObject() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update complaint.' });
  }
});

module.exports = router;
