const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');

const router = express.Router();

const dataFilePath = path.join(__dirname, '..', 'data', 'complaints.json');
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

async function ensureStorage() {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, '[]', 'utf8');
  }
}

async function readComplaints() {
  await ensureStorage();
  const raw = await fs.readFile(dataFilePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeComplaints(complaints) {
  await fs.writeFile(dataFilePath, JSON.stringify(complaints, null, 2), 'utf8');
}

function buildTicketNumber(existingComplaints) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${d}`;

  const todayCount = existingComplaints.filter((item) => String(item.ticket || '').includes(`CMP-${datePart}-`)).length;
  const sequence = String(todayCount + 1).padStart(4, '0');
  return `CMP-${datePart}-${sequence}`;
}

router.get('/', async (req, res) => {
  try {
    const complaints = await readComplaints();
    complaints.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json({ success: true, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load complaints.' });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const complaints = await readComplaints();
    const { name = '', email = '', phone = '', location = '', details = '' } = req.body || {};

    if (!name.trim() || !email.trim() || !location.trim() || !details.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email, location, and details are required.' });
    }

    const ticket = buildTicketNumber(complaints);
    let imagePath = '';

    if (req.file && req.file.buffer) {
      const ext = req.file.mimetype === 'image/png' ? '.png' : '.jpg';
      const safeTicket = ticket.replace(/[^A-Z0-9-]/gi, '_');
      const filename = `${safeTicket}${ext}`;
      const absoluteImagePath = path.join(uploadsDir, filename);
      await fs.writeFile(absoluteImagePath, req.file.buffer);
      imagePath = `/assets/images/complaints/${filename}`;
    }

    const complaint = {
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
      createdAt: new Date().toISOString(),
    };

    complaints.unshift(complaint);
    await writeComplaints(complaints);

    return res.status(201).json({
      success: true,
      ticket,
      complaint,
      message: 'Complaint submitted successfully.',
    });
  } catch (error) {
    if (error && error.message && error.message.includes('Only JPG and PNG')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Unable to submit complaint right now.' });
  }
});

module.exports = router;
