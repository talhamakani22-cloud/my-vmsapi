import { useMemo, useState } from 'react';
import './Report.css';
import { apiUrl } from './apiClient';

function ComplaintForm() {
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));

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

  return (
    <div className="report-container">
      <div className="report-header">
        <div className="report-title">
          <div>
            <h1>Submit a Complaint</h1>
            <p className="subtitle">This form can be opened from a QR code without launching the app.</p>
          </div>
        </div>
      </div>

      <div className="report-content">
        <form onSubmit={handleSubmit} className="filters-section" style={{ maxWidth: 720 }}>
          <div className="filter-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="date-picker-group">
              <label>Name</label>
              <input name="name" required value={form.name} onChange={handleChange} className="date-input" />
            </div>
            <div className="date-picker-group">
              <label>Email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="date-input" />
            </div>
            <div className="date-picker-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="date-input" />
            </div>
            <div className="date-picker-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="date-input" />
            </div>
          </div>

          <div className="date-picker-group" style={{ marginTop: 12 }}>
            <label>Complaint Details</label>
            <textarea name="details" required value={form.details} onChange={handleChange} className="date-input" rows={6} />
          </div>

          <div className="report-actions" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
            <button className="search-btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>

          {message && <p style={{ marginTop: 12, color: ticket ? '#0b7a0b' : '#b91c1c' }}>{message}</p>}
          {ticketSummary && <p style={{ marginTop: 8 }}>{ticketSummary}</p>}
        </form>
      </div>
    </div>
  );
}

export default ComplaintForm;
