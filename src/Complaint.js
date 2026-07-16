import React, { useState, useRef } from 'react';
import './Complaint.css';

const sampleTickets = [
  { ticket: 'CP-1001', status: 'Pending', name: 'Nadia Al Suwaidi', submittedOn: '2026-07-14' },
  { ticket: 'CP-1002', status: 'In Progress', name: 'Ahmed Khan', submittedOn: '2026-07-15' },
  { ticket: 'CP-1003', status: 'Resolved', name: 'Sara Al Mansoori', submittedOn: '2026-07-12' },
];

function Complaint({ mode, onBack }) {
  const [ticketNumber, setTicketNumber] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', details: '' });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [scanOpen, setScanOpen] = useState(mode === 'registration');
  const fileInputRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleScanClick = () => {
    setScanOpen(true);
    setSubmitted(false);
    setStatus('');
  };

  const handleScanComplete = () => {
    setScanOpen(false);
    setStatus('QR scanned. Please complete the complaint form below.');
  };

  const handleSubmitComplaint = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setStatus('Complaint submitted successfully. Your ticket number is CP-12345.');
  };

  const handleCheckStatus = (event) => {
    event.preventDefault();
    if (!ticketNumber.trim()) {
      setStatus('Please enter a valid ticket number.');
      return;
    }
    const ticket = sampleTickets.find((item) => item.ticket === ticketNumber.trim().toUpperCase());
    if (ticket) {
      setStatus(`Ticket ${ticket.ticket}: ${ticket.status}. Submitted by ${ticket.name} on ${ticket.submittedOn}.`);
    } else {
      setStatus(`Ticket ${ticketNumber.trim()}: Not found. Please verify your ticket number.`);
    }
  };

  return (
    <div className="complaint-container">
      <div className="complaint-header">
        <button className="back-dashboard" onClick={onBack}>Back</button>
        <div>
          <h1>{mode === 'registration' ? 'Complaint Registration' : 'Complaint Tracking'}</h1>
          <p>
            {mode === 'registration'
              ? 'Scan a complaint QR code to open the form, then upload an image, fill details, and submit.'
              : 'Track your complaint using the ticket number. Search results display in a table view.'}
          </p>
        </div>
      </div>

      {mode === 'registration' ? (
        <>
          <div className="scan-section">
            <div className="scan-card">
              <h2>QR Scan</h2>
              <p>Click the button below to simulate scanning a complaint QR code.</p>
              <button className="action-btn primary" onClick={handleScanComplete}>
                Scan QR Code
              </button>
            </div>
          </div>

          {scanOpen && (
            <div className="scan-overlay">
              <div className="scan-modal">
                <h3>Scanning complaint QR code...</h3>
                <p>Scan complete. The complaint form is now available.</p>
                <button className="action-btn primary" onClick={handleScanComplete}>Continue</button>
              </div>
            </div>
          )}

          <form className="complaint-form" onSubmit={handleSubmitComplaint}>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full name"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                type="email"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="details">Complaint Details</label>
              <textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="Describe the issue"
                rows="5"
                required
              />
            </div>
            <div className="form-field">
              <label>Upload Image</label>
              <div className="upload-row">
                <button type="button" className="action-btn secondary" onClick={() => fileInputRef.current?.click()}>
                  Add / Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              {uploadedImage && (
                <img className="uploaded-preview" src={uploadedImage} alt="Uploaded complaint" />
              )}
            </div>
            <button type="submit" className="action-btn primary">Submit Complaint</button>
          </form>
        </>
      ) : (
        <>
          <form className="complaint-form" onSubmit={handleCheckStatus}>
            <div className="form-field">
              <label htmlFor="ticketNumber">Complaint Ticket Number</label>
              <input
                id="ticketNumber"
                name="ticketNumber"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="Enter ticket number"
                required
              />
            </div>
            <button type="submit" className="action-btn primary">Track Status</button>
          </form>

          <div className="tracking-table-wrapper">
            <table className="tracking-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {sampleTickets.map((item) => (
                  <tr key={item.ticket}>
                    <td>{item.ticket}</td>
                    <td>{item.name}</td>
                    <td>{item.status}</td>
                    <td>{item.submittedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="complaint-status">
        {submitted || status ? (
          <div className="status-box">
            <h3>Status</h3>
            <p>{status}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Complaint;
