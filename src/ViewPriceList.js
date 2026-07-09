import { useEffect, useState } from 'react';
import './ViewPriceList.css';
import AddPrice from './AddPrice';

const STORAGE_KEY = 'addPriceRecords';

const DEFAULT_PRICE_LIST_ROWS = [
  {
    serviceCode: 'SC-1001',
    priceItemName: 'Consultation Fee',
    receiverId: 'receiver-1',
    healthPlan: 'basic',
    codeType: 'icd',
    finClass: 'class-a',
    priceListName: 'list-1',
    grossPrice: '250',
    beginEffectiveDate: '2026-01-01',
    endEffectiveDate: '2026-12-31',
    exclusionFlagType: 'no',
    preApprovedFlag: 'yes',
    fileName: 'consultation-prices.csv',
    confirm: true,
    isActive: true,
  },
  {
    serviceCode: 'SC-2045',
    priceItemName: 'Lab Test Panel',
    receiverId: 'receiver-2',
    healthPlan: 'premium',
    codeType: 'cpt',
    finClass: 'class-b',
    priceListName: 'list-2',
    grossPrice: '480',
    beginEffectiveDate: '2026-02-15',
    endEffectiveDate: '2026-11-30',
    exclusionFlagType: 'yes',
    preApprovedFlag: 'no',
    fileName: 'lab-panel-prices.csv',
    confirm: false,
    isActive: true,
  },
];

function ViewPriceList({ onBackToDashboard }) {
  const [rows, setRows] = useState([]);
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [statusDropdownIndex, setStatusDropdownIndex] = useState(null);

  const loadRows = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const safeRows = Array.isArray(parsed) ? parsed : [];
      if (safeRows.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRICE_LIST_ROWS));
        setRows(DEFAULT_PRICE_LIST_ROWS);
        return;
      }
      setRows(safeRows);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div className="view-price-list-container">
      <div className="bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="view-price-list-header">
        <div className="view-price-list-title">
          <button className="back-btn" onClick={onBackToDashboard}>
            ←
          </button>
          <div>
            <h1>View Price List</h1>
            <p className="subtitle">All Add Price records</p>
          </div>
        </div>
      </div>

      <div className="view-price-list-content">
        <div className="table-actions">
          <button
            className="table-action-btn"
            onClick={() => {
              setEditIndex(null);
              setEditingRow(null);
              setShowAddPriceModal(true);
            }}
          >
            Add Price
          </button>
        </div>

        <div className="table-wrapper">
          <table className="price-list-table">
            <thead>
              <tr>
                <th>Service Code</th>
                <th>Price item name</th>
                <th>TPA/ Receiver ID</th>
                <th>Health Plan</th>
                <th>Code Type</th>
                <th>Fin Class</th>
                <th>Price List Name</th>
                <th>Gross Price</th>
                <th>Begin Effected date</th>
                <th>End Effected date</th>
                <th>Exclusion Flag Type</th>
                <th>Pre Approved Flag</th>
                <th>File</th>
                <th>Please Confirm</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <tr key={`${row.serviceCode || 'row'}-${index}`} className={row.isActive === false ? 'inactive-row' : ''}>
                    <td>{row.serviceCode || '-'}</td>
                    <td>{row.priceItemName || '-'}</td>
                    <td>{row.receiverId || '-'}</td>
                    <td>{row.healthPlan || '-'}</td>
                    <td>{row.codeType || '-'}</td>
                    <td>{row.finClass || '-'}</td>
                    <td>{row.priceListName || '-'}</td>
                    <td>{row.grossPrice || '-'}</td>
                    <td>{row.beginEffectiveDate || '-'}</td>
                    <td>{row.endEffectiveDate || '-'}</td>
                    <td>{row.exclusionFlagType || '-'}</td>
                    <td>{row.preApprovedFlag || '-'}</td>
                    <td>{row.fileName || '-'}</td>
                    <td>{row.confirm ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action-btn"
                          onClick={() => {
                            setEditIndex(index);
                            setEditingRow(row);
                            setShowAddPriceModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="row-action-btn delete"
                          onClick={() => {
                            setStatusDropdownIndex((currentIndex) => (currentIndex === index ? null : index));
                          }}
                        >
                          Delete
                        </button>
                        {statusDropdownIndex === index && (
                          <select
                            className="status-dropdown"
                            defaultValue={row.isActive === false ? 'non-active' : 'active'}
                            onChange={(event) => {
                              const selected = event.target.value;
                              const nextRows = rows.map((existingRow, rowIndex) => {
                                if (rowIndex !== index) return existingRow;
                                return {
                                  ...existingRow,
                                  isActive: selected === 'active',
                                };
                              });
                              setRows(nextRows);
                              localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRows));
                              setStatusDropdownIndex(null);
                            }}
                          >
                            <option value="active">Active</option>
                            <option value="non-active">Non Active</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" className="no-results">
                    No price list records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddPriceModal && (
        <div className="add-price-modal-overlay" onClick={() => setShowAddPriceModal(false)}>
          <div className="add-price-modal-content" onClick={(event) => event.stopPropagation()}>
            <AddPrice
              isPopup
              onClose={() => setShowAddPriceModal(false)}
              initialData={editingRow}
              editIndex={editIndex}
              onSubmitSuccess={() => {
                setEditIndex(null);
                setEditingRow(null);
                loadRows();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPriceList;