import { useEffect, useMemo, useState } from 'react';
import './Report.css';
import { apiUrl } from './apiClient';

function ComplaintTrack() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(apiUrl('/api/complaints'));
        const data = await response.json();
        if (data.success) {
          setComplaints(data.complaints || []);
        } else {
          setError(data.message || 'Failed to load complaints');
        }
      } catch (err) {
        setError('Unable to load complaints right now.');
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return complaints;
    return complaints.filter((item) => [item.ticket, item.name, item.email, item.status, item.details]
      .join(' ')
      .toLowerCase()
      .includes(query));
  }, [complaints, search]);

  return (
    <div className="report-container">
      <div className="report-header">
        <div className="report-title">
          <div>
            <h1>Track Complaint</h1>
            <p className="subtitle">View submitted complaints in a report-style table.</p>
          </div>
        </div>
      </div>

      <div className="report-content">
        <div className="filters-section" style={{ maxWidth: 920 }}>
          <div className="search-group">
            <label>Search complaints</label>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by ticket, name, email or status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          {error && <p style={{ marginTop: 12, color: '#b91c1c' }}>{error}</p>}
        </div>

        <div className="filters-section" style={{ maxWidth: 1200, marginTop: 20 }}>
          <div className="table-wrapper">
            <table className="visitors-report-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Submitted</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="no-results">Loading complaints...</td></tr>
                ) : filteredComplaints.length > 0 ? (
                  filteredComplaints.map((record) => (
                    <tr key={record.ticket}>
                      <td>{record.ticket}</td>
                      <td>{record.status || 'Pending'}</td>
                      <td>{record.name}</td>
                      <td>{record.email}</td>
                      <td>{record.location || '-'}</td>
                      <td>{new Date(record.createdAt).toLocaleString()}</td>
                      <td>{record.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="no-results">No complaints found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintTrack;
