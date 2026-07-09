import { useEffect, useState } from 'react';
import './NiewPriceRule.css';
import AddPriceRule from './AddPriceRule';

const STORAGE_KEY = 'addPriceRuleRecords';

const DEFAULT_PRICE_RULE_ROWS = [
  {
    ruleName: 'Rule Alpha',
    receiverId: 'receiver-1',
    healthPlan: 'basic',
    priceListName: 'list-1',
    codeType: 'icd',
    activityType: 'increase',
    operandTypeCode: 'rule-1',
    operatorTypeCode: 'rule-a',
    discountValue: '10',
    beginEffectiveDate: '2026-01-01',
    endEffectiveDate: '2026-12-31',
    fileName: 'rule-alpha.csv',
    isActive: true,
  },
  {
    ruleName: 'Rule Beta',
    receiverId: 'receiver-2',
    healthPlan: 'premium',
    priceListName: 'list-2',
    codeType: 'cpt',
    activityType: 'decrease',
    operandTypeCode: 'rule-2',
    operatorTypeCode: 'rule-b',
    discountValue: '15',
    beginEffectiveDate: '2026-03-01',
    endEffectiveDate: '2026-10-31',
    fileName: 'rule-beta.csv',
    isActive: true,
  },
];

function NiewPriceRule({ onBackToDashboard }) {
  const [rows, setRows] = useState([]);
  const [showAddPriceRuleModal, setShowAddPriceRuleModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [statusDropdownIndex, setStatusDropdownIndex] = useState(null);

  const loadRows = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const safeRows = Array.isArray(parsed) ? parsed : [];
      if (safeRows.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRICE_RULE_ROWS));
        setRows(DEFAULT_PRICE_RULE_ROWS);
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
    <div className="niew-price-rule-container">
      <div className="bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="niew-price-rule-header">
        <div className="niew-price-rule-title">
          <button className="back-btn" onClick={onBackToDashboard}>
            ←
          </button>
          <div>
            <h1>View Price Rule</h1>
            <p className="subtitle">All Add Price Rule records</p>
          </div>
        </div>
      </div>

      <div className="niew-price-rule-content">
        <div className="table-actions">
          <button
            className="table-action-btn"
            onClick={() => {
              setEditIndex(null);
              setEditingRow(null);
              setShowAddPriceRuleModal(true);
            }}
          >
            Add Price Rule
          </button>
        </div>

        <div className="table-wrapper">
          <table className="price-rule-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>TPA/Receiver ID</th>
                <th>Health Plan</th>
                <th>Price List Name</th>
                <th>Code Type</th>
                <th>Activity Type</th>
                <th>Operand Type Code</th>
                <th>Operator Type Code</th>
                <th>Discount Value</th>
                <th>Begin Effected date</th>
                <th>End Effected date</th>
                <th>File</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <tr key={`${row.ruleName || 'rule'}-${index}`} className={row.isActive === false ? 'inactive-row' : ''}>
                    <td>{row.ruleName || '-'}</td>
                    <td>{row.receiverId || '-'}</td>
                    <td>{row.healthPlan || '-'}</td>
                    <td>{row.priceListName || '-'}</td>
                    <td>{row.codeType || '-'}</td>
                    <td>{row.activityType || '-'}</td>
                    <td>{row.operandTypeCode || '-'}</td>
                    <td>{row.operatorTypeCode || '-'}</td>
                    <td>{row.discountValue || '-'}</td>
                    <td>{row.beginEffectiveDate || '-'}</td>
                    <td>{row.endEffectiveDate || '-'}</td>
                    <td>{row.fileName || '-'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action-btn"
                          onClick={() => {
                            setEditIndex(index);
                            setEditingRow(row);
                            setShowAddPriceRuleModal(true);
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
                  <td colSpan="13" className="no-results">
                    No price rule records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddPriceRuleModal && (
        <div className="add-price-rule-modal-overlay" onClick={() => setShowAddPriceRuleModal(false)}>
          <div className="add-price-rule-modal-content" onClick={(event) => event.stopPropagation()}>
            <AddPriceRule
              isPopup
              onClose={() => setShowAddPriceRuleModal(false)}
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

export default NiewPriceRule;