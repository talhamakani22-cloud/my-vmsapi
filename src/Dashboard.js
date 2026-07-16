import { useEffect, useState } from 'react';
import './Dashboard.css';
import { apiUrl } from './apiClient';

function Dashboard({
  onNavigateToReport,
  onNavigateToViewPriceList,
  onNavigateToNiewPriceRule,
  onNavigateToUploadInvoice,
  onNavigateToComplaintRegistration,
  onNavigateToComplaintTracking,
  onLogout,
}) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchVisitors = async (showLoader = false) => {
      if (showLoader && isMounted) {
        setLoading(true);
      }
      setError('');
      try {
        const res = await fetch(apiUrl('/api/visitors'));
        const data = await res.json();
        if (data.success) {
          if (isMounted) {
            setVisitors(data.visitors);
          }
        } else {
          if (isMounted) {
            setError(data.message || 'Failed to fetch visitors');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch visitors');
        }
      }
      if (showLoader && isMounted) {
        setLoading(false);
      }
    };

    fetchVisitors(true);

    const refreshInterval = setInterval(() => {
      fetchVisitors(false);
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  // Compute stats
  const totalRecords = visitors.length;
  const maleCount = visitors.filter(v => v.gender === 'Male').length;
  const femaleCount = visitors.filter(v => v.gender === 'Female').length;
  const activeIds = visitors.length; // Assuming all are active
  // Expiring soon: expiryDate within next 30 days
  const expiringSoon = visitors.filter(v => {
    if (!v.expiryDate) return false;
    const expiry = new Date(v.expiryDate);
    const now = new Date();
    const diff = (expiry - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  // Visitor types
  const uaeCitizens = visitors.filter(v => v.nationality === 'UAE').length;
  const residents = visitors.filter(v => v.nationality !== 'UAE').length;
  const visitorTypes = [
    { type: 'UAE Citizens', count: uaeCitizens, color: '#6c63ff' },
    { type: 'Residents', count: residents, color: '#a78bfa' },
    { type: 'Active IDs', count: activeIds, color: '#38bdf8' },
    { type: 'Expiring Soon', count: expiringSoon, color: '#34d399' },
  ];
  const totalVisitorTypes = visitorTypes.reduce((sum, v) => sum + v.count, 0);

  // Recent visitors (last 5 by created time)
  const recentVisitors = [...visitors]
    .sort((a, b) => {
      const aDate = new Date(a.createdAt || a.checkInTime || a.issueDate || 0);
      const bDate = new Date(b.createdAt || b.checkInTime || b.issueDate || 0);
      return bDate - aDate;
    })
    .slice(0, 5);

  // Month-wise data from real records (last 6 months)
  const monthlyData = (() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - (5 - index));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        visitors: 0,
      };
    });

    const monthIndexByKey = months.reduce((acc, item, index) => {
      acc[item.key] = index;
      return acc;
    }, {});

    visitors.forEach((visitor) => {
      const eventDate = new Date(visitor.createdAt || visitor.checkInTime || visitor.issueDate || 0);
      if (Number.isNaN(eventDate.getTime())) return;
      const eventKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      const index = monthIndexByKey[eventKey];
      if (index !== undefined) {
        months[index].visitors += 1;
      }
    });

    return months.map(({ month, visitors }) => ({ month, visitors }));
  })();
  const maxVisitors = Math.max(...monthlyData.map(d => d.visitors), 1);

  return (
    <div className="dashboard-container">
      <div className="bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Emirates ID Dashboard</h1>
          <p className="subtitle">Monitor and manage Emirates ID records</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Records</span>
            <span className="stat-number">{totalRecords}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Male</span>
            <span className="stat-number">{maleCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Female</span>
            <span className="stat-number">{femaleCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active IDs</span>
            <span className="stat-number highlight">{activeIds}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Charts Row */}
        <div className="charts-row">
          {/* Monthly Registrations Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Monthly Registrations</h3>
            <div className="bar-chart">
              {monthlyData.map((item, index) => (
                <div className="bar-item" key={index}>
                  <div className="bar-container">
                    <div 
                      className="bar" 
                      style={{ height: `${(item.visitors / maxVisitors) * 100}%` }}
                    >
                      <span className="bar-value">{item.visitors}</span>
                    </div>
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ID Types Chart */}
          <div className="chart-card">
            <h3 className="chart-title">ID Statistics</h3>
            <div className="donut-chart-container">
              <div className="donut-chart">
                <svg viewBox="0 0 100 100">
                  {visitorTypes.reduce((acc, item, index) => {
                    const percentage = (item.count / totalVisitorTypes) * 100;
                    const previousPercentages = visitorTypes
                      .slice(0, index)
                      .reduce((sum, v) => sum + (v.count / totalVisitorTypes) * 100, 0);
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = -previousPercentages;
                    
                    acc.push(
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'all 0.3s ease' }}
                      />
                    );
                    return acc;
                  }, [])}
                </svg>
                <div className="donut-center">
                  <span className="donut-total">{totalVisitorTypes}</span>
                  <span className="donut-label">Total</span>
                </div>
              </div>
              <div className="legend">
                {visitorTypes.map((item, index) => (
                  <div className="legend-item" key={index}>
                    <span className="legend-color" style={{ background: item.color }}></span>
                    <span className="legend-text">{item.type}</span>
                    <span className="legend-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Records Table */}
        <div className="recent-visitors-card">
          <h3 className="chart-title">Recent Emirates ID Records</h3>
          <div className="visitors-table">
            <div className="table-header">
              <span>Emirates ID</span>
              <span>Full Name (English)</span>
              <span>Gender</span>
              <span>Expiry Date</span>
            </div>
            {recentVisitors.map((visitor, index) => (
              <div className="table-row" key={index}>
                <span className="visitor-name emirates-id">{visitor.emiratesId}</span>
                <span className="visitor-type">{visitor.fullNameEnglish || visitor.nameEn}</span>
                <span className={`visitor-status ${visitor.gender?.toLowerCase()}`}>
                  {visitor.gender}
                </span>
                <span className="visitor-time">{visitor.expiryDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="action-btn primary" onClick={onNavigateToReport}>
          View Reports
        </button>
        <button className="action-btn primary" onClick={onNavigateToViewPriceList}>
          View Price List
        </button>
        <button className="action-btn primary" onClick={onNavigateToNiewPriceRule}>
          View Price Rule
        </button>
        <button className="action-btn primary" onClick={onNavigateToUploadInvoice}>
          Upload Invoice
        </button>
        <button className="action-btn primary" onClick={() => setShowQrModal(true)}>
          Complaint QR
        </button>
        <button className="action-btn primary" onClick={onNavigateToComplaintTracking}>
          Complaint Tracking
        </button>
        {loading && <div style={{marginTop: 10}}>Loading...</div>}
        {error && <div style={{color: 'red', marginTop: 10}}>{error}</div>}
      </div>
      {showQrModal && (
        <div className="qr-overlay">
          <div className="qr-modal">
            <h3>Scan to Register a Complaint</h3>
            <p>Open the camera on your phone and scan this QR code to submit a complaint without login.</p>
            <img alt="Complaint QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/complaint.html')}`} />
            <div style={{ marginTop: 12 }}>
              <button className="action-btn secondary" onClick={() => setShowQrModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
