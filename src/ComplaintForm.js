import { useMemo, useRef, useState } from 'react';
import './Report.css';
import { apiUrl } from './apiClient';

function ComplaintForm({ onBackToDashboard }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [trackTicket, setTrackTicket] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      setImageError('');
      return;
    }

    const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png']);
    if (!allowedTypes.has(file.type)) {
      setImageFile(null);
      setImageError('Please upload a JPG or PNG image.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageFile(null);
      setImageError('Image is too large. Maximum allowed size is 10 MB.');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImageError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (imageFile) {
      payload.append('file', imageFile);
    }

    try {
      const response = await fetch(apiUrl('/api/complaints'), {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();
      if (data.success) {
        setTicket(data.ticket);
        setMessage('Complaint submitted successfully.');
        setForm({ name: '', email: '', phone: '', location: '', details: '' });
        setImageFile(null);
        setImageError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage(data.message || 'Unable to submit complaint.');
      }
    } catch (error) {
      setMessage('Unable to submit complaint right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const ticketSummary = useMemo(() => {
    if (!ticket) return null;
    return `Your complaint reference is ${ticket}. You can track it using the same ticket number.`;
  }, [ticket]);

  const handleTrackComplaint = async (e) => {
    e.preventDefault();
    const normalizedTicket = trackTicket.trim().toUpperCase();

    if (!normalizedTicket) {
      setTrackError('Please enter your complaint ticket number.');
      setTrackedComplaint(null);
      return;
    }

    setTrackLoading(true);
    setTrackError('');
    setTrackedComplaint(null);

    try {
      const response = await fetch(apiUrl('/api/complaints'));
      const data = await response.json();

      if (!data.success) {
        setTrackError(data.message || 'Unable to track complaint right now.');
        return;
      }

      const match = (data.complaints || []).find(
        (item) => String(item.ticket || '').toUpperCase() === normalizedTicket,
      );

      if (!match) {
        setTrackError('No complaint found for this ticket number.');
        return;
      }

      setTrackedComplaint(match);
    } catch (error) {
      setTrackError('Unable to track complaint right now.');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <div className="report-title">
          {onBackToDashboard && (
            <button className="back-btn" onClick={onBackToDashboard}>
              ←
            </button>
          )}
          <div>
            <h1>Submit a Complaint</h1>
            <p className="subtitle">This form can be opened from a QR code without launching the app.</p>
          </div>
        </div>
      </div>

      <div className="report-content">
        <form onSubmit={handleSubmit} className="filters-section complaint-form-layout">
          <div className="complaint-form-grid">
            <div className="date-picker-group">
              <label>Name</label>
              <input name="name" required value={form.name} onChange={handleChange} className="date-input complaint-input" />
            </div>
            <div className="date-picker-group">
              <label>Email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="date-input complaint-input" />
            </div>
            <div className="date-picker-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="date-input complaint-input" />
            </div>
            <div className="date-picker-group">
              <label>Location / Flat No</label>
              <input name="location" value={form.location} onChange={handleChange} className="date-input complaint-input" />
            </div>
            <div className="date-picker-group complaint-upload-group">
              <label>Upload Image (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
                className="date-input complaint-input"
              />
              <small className="complaint-upload-note">Attach a photo of the issue (JPG/PNG, up to 10 MB).</small>
            </div>
          </div>

          <div className="date-picker-group complaint-details-group">
            <label>Complaint Details</label>
            <textarea name="details" required value={form.details} onChange={handleChange} className="date-input complaint-input complaint-textarea" rows={6} />
          </div>

          <div className="report-actions" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
            <button className="search-btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>

          {imageError && <p style={{ marginTop: 12, color: '#b91c1c' }}>{imageError}</p>}
          {message && <p style={{ marginTop: 12, color: ticket ? '#0b7a0b' : '#b91c1c' }}>{message}</p>}
          {ticketSummary && <p style={{ marginTop: 8 }}>{ticketSummary}</p>}
        </form>

        <form onSubmit={handleTrackComplaint} className="filters-section complaint-form-layout complaint-track-layout">
          <div className="complaint-track-header">
            <h3>Track Complaint</h3>
            <p>Enter your ticket number to check status and submitted details.</p>
          </div>

          <div className="complaint-track-row">
            <div className="date-picker-group">
              <label>Ticket Number</label>
              <input
                value={trackTicket}
                onChange={(e) => setTrackTicket(e.target.value)}
                className="date-input complaint-input"
                placeholder="e.g. CMP-123456"
              />
            </div>
            <button className="search-btn" type="submit" disabled={trackLoading}>
              {trackLoading ? 'Tracking...' : 'Track Complaint'}
            </button>
          </div>

          {trackError && <p style={{ marginTop: 12, color: '#b91c1c' }}>{trackError}</p>}

          {trackedComplaint && (
            <div className="complaint-track-result">
              <div><strong>Ticket:</strong> {trackedComplaint.ticket}</div>
              <div><strong>Status:</strong> {trackedComplaint.status || 'Pending'}</div>
              <div><strong>Name:</strong> {trackedComplaint.name || '-'}</div>
              <div><strong>Email:</strong> {trackedComplaint.email || '-'}</div>
              <div><strong>Phone:</strong> {trackedComplaint.phone || '-'}</div>
              <div><strong>Location / Flat No:</strong> {[trackedComplaint.location, trackedComplaint.flatNo].filter(Boolean).join(' / ') || '-'}</div>
              <div><strong>Type:</strong> {trackedComplaint.type || 'General'}</div>
              <div><strong>Submitted:</strong> {trackedComplaint.createdAt ? new Date(trackedComplaint.createdAt).toLocaleString() : '-'}</div>
              <div><strong>Follow-up Note:</strong> {trackedComplaint.followUpNote || 'Complaint registered'}</div>
              <div><strong>Remarks:</strong> {trackedComplaint.assignedTo || '-'}</div>
              <div className="complaint-track-details"><strong>Details:</strong> {trackedComplaint.details || '-'}</div>
              {trackedComplaint.imagePath && (
                <div style={{ marginTop: 8 }}>
                  <strong>Uploaded Picture:</strong>
                  <br />
                  <img
                    src={apiUrl(trackedComplaint.imagePath)}
                    alt="Complaint attachment"
                    style={{ marginTop: 6, maxWidth: '100%', borderRadius: 6 }}
                  />
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ComplaintForm;
