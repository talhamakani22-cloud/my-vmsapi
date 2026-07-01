import { useCallback, useEffect, useMemo, useState } from 'react';
import './Report.css';
import { apiUrl } from './apiClient';

function Report({ onBackToDashboard, onRequireLogin }) {
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user && onRequireLogin) {
      onRequireLogin();
    }
  }, [onRequireLogin]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');


  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const query = params.toString();
      const res = await fetch(apiUrl(`/api/visitors${query ? `?${query}` : ''}`));
      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors);
      } else {
        setError(data.message || 'Failed to fetch visitors');
      }
    } catch (err) {
      setError('Failed to fetch visitors');
    }
    setLoading(false);
  }, [searchQuery, startDate, endDate]);

  // Initial load + auto-refresh every minute
  useEffect(() => {
    fetchVisitors();
    const refreshInterval = setInterval(() => {
      fetchVisitors();
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchVisitors]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Prevent search if all fields are empty
    if (!searchQuery.trim() && !startDate.trim() && !endDate.trim()) {
      setError('Please enter at least one filter value.');
      return;
    }
    setError('');
    fetchVisitors();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setSelectedMonth('');
    setError('');
    // Fetch all visitors after clearing filters
    fetchVisitors();
  };

  const monthlySummary = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        total: 0,
      };
    });

    const monthIndexByKey = months.reduce((acc, month, index) => {
      acc[month.key] = index;
      return acc;
    }, {});

    visitors.forEach((visitor) => {
      const eventDate = new Date(visitor.createdAt || visitor.checkInTime || visitor.issueDate || 0);
      if (Number.isNaN(eventDate.getTime())) return;
      const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      const index = monthIndexByKey[key];
      if (index !== undefined) {
        months[index].total += 1;
      }
    });

    return months;
  }, [visitors]);

  const displayedVisitors = useMemo(() => {
    if (!selectedMonth) return visitors;
    return visitors.filter((visitor) => {
      const eventDate = new Date(visitor.createdAt || visitor.checkInTime || visitor.issueDate || 0);
      if (Number.isNaN(eventDate.getTime())) return false;
      const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonth;
    });
  }, [visitors, selectedMonth]);

  const handlePrintReport = async () => {
    await fetchVisitors();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="report-container">
      <div className="bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="report-header">
        <div className="report-title">
          <button className="back-btn" onClick={onBackToDashboard}>
            ←
          </button>
          <div>
            <h1>Emirates ID Report</h1>
            <p className="subtitle">View and filter Emirates ID records</p>
          </div>
        </div>
      </div>

      <div className="report-content">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-row">
            {/* Date Pickers */}
            <div className="date-picker-group">
              <label>From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-picker-group">
              <label>To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-picker-group">
              <label>Report Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="date-input"
              >
                <option value="">All Months</option>
                {monthlySummary.map((month) => (
                  <option key={month.key} value={month.key}>
                    {month.label} ({month.total})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="search-group">
              <label>Search</label>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by Emirates ID, name, nationality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <button className="clear-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
            <button className="search-btn" onClick={handleSearch}>
              🔍 Search
            </button>
            <button className="refresh-btn" onClick={fetchVisitors}>
              🔄 Refresh
            </button>
          </div>

          <div className="results-count">
            {loading ? 'Loading...' : `Showing ${displayedVisitors.length} records`}
            {error && <span style={{ color: 'red', marginLeft: 10 }}>{error}</span>}
          </div>

          <div className="results-count" style={{ marginTop: 10 }}>
            {selectedMonth
              ? `Monthly view active: ${monthlySummary.find((month) => month.key === selectedMonth)?.label || selectedMonth}`
              : 'Monthly view: All Months'}
          </div>
        </div>

        {/* Visitors Table */}
        <div className="table-wrapper">
          <table className="visitors-report-table">
            <thead>
              <tr>
                <th>Emirates ID Number</th>
                <th>Full Name (English)</th>
                <th>Full Name (Arabic)</th>
                <th>Nationality</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Expiry Date</th>
                <th>Issue Date</th>
                <th>Purpose of Visit</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {displayedVisitors.length > 0 ? (
                displayedVisitors.map((visitor, index) => (
                  <tr key={index}>
                    <td className="emirates-id-cell">{visitor.emiratesId}</td>
                    <td className="name-en-cell">{visitor.fullNameEnglish}</td>
                    <td className="name-ar-cell" dir="rtl">{visitor.fullNameArabic}</td>
                    <td>
                      <span className="nationality-badge">{visitor.nationality}</span>
                    </td>
                    <td>{visitor.dateOfBirth}</td>
                    <td>
                      <span className={`gender-badge ${visitor.gender?.toLowerCase()}`}>{visitor.gender}</span>
                    </td>
                    <td>{visitor.expiryDate}</td>
                    <td>{visitor.issueDate}</td>
                    <td>{visitor.purposeOfVisit || '-'}</td>
                    <td>{visitor.remark || visitor.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-results">
                    No monthly records found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-actions">
        <button className="action-btn export-btn">
          📥 Export to CSV
        </button>
        <button className="action-btn print-btn" onClick={handlePrintReport}>
          🖨️ Print Report
        </button>
        <button className="action-btn back-dashboard" onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Report;
