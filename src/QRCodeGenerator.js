import { useEffect, useState } from 'react';
import './Report.css';

function QRCodeGenerator({ onBackToDashboard }) {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Construct the complaint URL based on current environment
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const portStr = port ? `:${port}` : '';
    const complaintUrl = `${protocol}//${hostname}${portStr}/?screen=complaintForm`;
    setQrUrl(complaintUrl);
    setLoading(false);
  }, []);

  const downloadQR = () => {
    // Create QR code using an external API
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
    const link = document.createElement('a');
    link.href = apiUrl;
    link.download = 'complaint-registration-qr.png';
    link.click();
  };

  const copyURL = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      alert('URL copied to clipboard!');
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
            <h1>📱 Complaint Registration QR Code</h1>
            <p className="subtitle">Scan this QR code to register a complaint without opening the app</p>
          </div>
        </div>
      </div>

      <div className="report-content">
        <div className="filters-section" style={{ maxWidth: 600, textAlign: 'center' }}>
          <p style={{ marginBottom: 20 }}>Share this QR code with users so they can register complaints directly.</p>

          {/* QR Code Image */}
          <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', marginBottom: 20 }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`}
              alt="QR Code"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          </div>

          {/* URL Display */}
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '8px',
            wordBreak: 'break-all',
            color: '#374151',
            fontSize: '12px',
            marginBottom: 20
          }}>
            {qrUrl}
          </div>

          {/* Action Buttons */}
          <div className="report-actions" style={{ justifyContent: 'center', gap: 10 }}>
            <button className="search-btn" onClick={downloadQR}>
              📥 Download QR Code
            </button>
            <button className="search-btn" onClick={copyURL} style={{ background: '#6b7280' }}>
              📋 Copy URL
            </button>
          </div>

          {/* Instructions */}
          <div style={{ marginTop: 24, textAlign: 'left', background: '#f3f4f6', padding: 16, borderRadius: 8 }}>
            <h4>How to use:</h4>
            <ol>
              <li>Download or take a screenshot of the QR code</li>
              <li>Display it at reception, waiting areas, or via email</li>
              <li>Users scan the code with their phone camera</li>
              <li>They are taken directly to the complaint form</li>
              <li>After submission, they receive a complaint ticket number</li>
              <li>They can track their complaint using the ticket number</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodeGenerator;
