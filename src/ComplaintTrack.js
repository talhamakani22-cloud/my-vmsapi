import { useEffect, useMemo, useState } from 'react';
import './Report.css';
import { apiUrl } from './apiClient';

const STATUS_META = {
  registered: { label: 'REGISTERED', progress: 15 },
  assigned: { label: 'ASSIGNED', progress: 50 },
  'in progress': { label: 'IN PROGRESS', progress: 75 },
  resolved: { label: 'RESOLVED', progress: 100 },
  closed: { label: 'CLOSED', progress: 100 },
  pending: { label: 'PENDING', progress: 25 },
};

const getStatusMeta = (status) => {
  const key = (status || 'registered').toLowerCase();
  return STATUS_META[key] || { label: (status || 'REGISTERED').toUpperCase(), progress: 35 };
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

function ComplaintTrack() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTicket, setExpandedTicket] = useState('');

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

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((item) => {
      const status = (item.status || 'registered').toLowerCase();
      const statusMatches = statusFilter === 'all' || status === statusFilter;
      if (!statusMatches) return false;
      if (!query) return true;

      return [
        item.ticket,
        item.name,
        item.email,
        item.status,
        item.details,
        item.location,
        item.flatNo,
        item.type,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [complaints, search, statusFilter]);

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
        <div className="filters-section complaint-track-toolbar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by ticket no, flat, type, description, status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            className="filter-select complaint-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="registered">Registered</option>
            <option value="assigned">Assigned</option>
            <option value="in progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <button type="button" className="refresh-btn complaint-refresh-btn" onClick={loadComplaints}>
            Refresh
          </button>
        </div>

        {error && <p style={{ marginTop: 12, color: '#b91c1c' }}>{error}</p>}

        <div className="filters-section complaint-track-cards-shell">
          {loading ? (
            <p className="no-results">Loading complaints...</p>
          ) : filteredComplaints.length > 0 ? (
            <div className="complaint-track-cards">
              {filteredComplaints.map((record) => {
                const statusMeta = getStatusMeta(record.status);
                const isExpanded = expandedTicket === record.ticket;

                return (
                  <article key={record.ticket} className="complaint-track-card">
                    <div className="complaint-track-card-head">
                      <h3>{record.ticket || 'No Ticket'}</h3>
                      <span className="complaint-track-status-pill">{statusMeta.label}</span>
                    </div>

                    <p className="complaint-track-meta">
                      <strong>Location:</strong> {record.location || 'Reception'}
                      {'  '}|{'  '}
                      <strong>Type:</strong> {record.type || 'General'}
                      {'  '}|{'  '}
                      <strong>By:</strong> {record.name || 'Anonymous'}
                    </p>

                    <p className="complaint-track-desc">{record.details || 'No description provided.'}</p>

                    <div className="complaint-track-progress-wrap">
                      <div className="complaint-track-progress-bar" style={{ width: `${statusMeta.progress}%` }} />
                    </div>

                    <p className="complaint-track-progress-text">Progress: {statusMeta.progress}%</p>
                    <p className="complaint-track-note"><strong>Follow-up Note:</strong> {record.followUpNote || 'Complaint registered'}</p>
                    <p className="complaint-track-note"><strong>Assigned To:</strong> {record.assignedTo || '-'}</p>

                    <button
                      type="button"
                      className="search-btn complaint-details-btn"
                      onClick={() => setExpandedTicket(isExpanded ? '' : record.ticket)}
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>

                    {isExpanded && (
                      <div className="complaint-track-expanded">
                        <p><strong>Name:</strong> {record.name || '-'}</p>
                        <p><strong>Email:</strong> {record.email || '-'}</p>
                        <p><strong>Flat:</strong> {record.flatNo || '-'}</p>
                        <p><strong>Submitted:</strong> {formatDateTime(record.createdAt)}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="no-results">No complaints found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintTrack;
