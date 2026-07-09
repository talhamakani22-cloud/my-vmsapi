import { useEffect, useState } from 'react';
import './AddPrice.css';

const STORAGE_KEY = 'addPriceRuleRecords';
const REQUEST_BODIES_KEY = 'addPriceRuleRequestBodies';

const formatDateForBody = (dateValue) => {
  if (!dateValue) return '';

  const alreadyFormatted = /^(\d{2})-([A-Za-z]{3})-(\d{2})$/;
  if (alreadyFormatted.test(dateValue)) {
    const [, day, mon, year] = dateValue.match(alreadyFormatted);
    const normalizedMonth = `${mon.charAt(0).toUpperCase()}${mon.slice(1).toLowerCase()}`;
    return `${day}-${normalizedMonth}-${year}`;
  }

  const [year, month, day] = dateValue.split('-');
  if (!year || !month || !day) return '';

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = Number(month) - 1;
  const monthLabel = monthNames[monthIndex];
  if (!monthLabel) return '';

  return `${day}-${monthLabel}-${year.slice(-2)}`;
};

const buildRequestBody = (formData, selectedFileName) => ({
  receiverid: formData.receiverId,
  codetype: formData.codeType,
  optype: formData.operandTypeCode,
  operators: formData.operatorTypeCode,
  disc: formData.discountValue,
  rulename: formData.ruleName,
  begeff: formatDateForBody(formData.beginEffectiveDate),
  endeff: formatDateForBody(formData.endEffectiveDate),
  healthplan: formData.healthPlan,
  pricename: formData.priceListName,
  activity_type: formData.activityType,
  filename: selectedFileName,
});

function AddPriceRule({
  isPopup = false,
  onClose,
  onSubmitSuccess,
  initialData = null,
  editIndex = null,
}) {
  const [formData, setFormData] = useState({
    ruleName: '',
    receiverId: '',
    healthPlan: '',
    priceListName: '',
    codeType: '',
    activityType: '',
    operandTypeCode: '',
    operatorTypeCode: '',
    discountValue: '',
    beginEffectiveDate: '',
    endEffectiveDate: '',
  });

  const [selectedFileName, setSelectedFileName] = useState('No file chosen');
  const requestBodyPreview = buildRequestBody(formData, selectedFileName);

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      ruleName: initialData.ruleName || '',
      receiverId: initialData.receiverId || '',
      healthPlan: initialData.healthPlan || '',
      priceListName: initialData.priceListName || '',
      codeType: initialData.codeType || '',
      activityType: initialData.activityType || '',
      operandTypeCode: initialData.operandTypeCode || '',
      operatorTypeCode: initialData.operatorTypeCode || '',
      discountValue: initialData.discountValue || '',
      beginEffectiveDate: initialData.beginEffectiveDate || '',
      endEffectiveDate: initialData.endEffectiveDate || '',
    });
    setSelectedFileName(initialData.fileName || 'No file chosen');
  }, [initialData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousState) => ({
      ...previousState,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFileName(file ? file.name : 'No file chosen');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requestBody = buildRequestBody(formData, selectedFileName);

    const newRow = {
      ...formData,
      fileName: selectedFileName,
      createdAt: new Date().toISOString(),
      isActive: initialData?.isActive ?? true,
      requestBody,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const safeRows = Array.isArray(parsed) ? parsed : [];
      let nextRows = [newRow, ...safeRows];
      if (typeof editIndex === 'number' && editIndex >= 0 && editIndex < safeRows.length) {
        nextRows = safeRows.map((row, index) => (index === editIndex ? newRow : row));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRows));

      const bodyStored = localStorage.getItem(REQUEST_BODIES_KEY);
      const bodyParsed = bodyStored ? JSON.parse(bodyStored) : [];
      const safeBodies = Array.isArray(bodyParsed) ? bodyParsed : [];
      const nextBodies = [{ createdAt: new Date().toISOString(), requestBody }, ...safeBodies];
      localStorage.setItem(REQUEST_BODIES_KEY, JSON.stringify(nextBodies));

      if (onSubmitSuccess) {
        onSubmitSuccess(newRow);
      }
      if (isPopup && onClose) {
        onClose();
      }
    } catch {
      // Keep form UX stable even if localStorage is unavailable.
    }
  };

  return (
    <div className={`add-price-container ${isPopup ? 'popup-mode' : ''}`}>
      <div className="add-price-shell">
        <div className="add-price-header-row">
          <div>
            <h1>Add Price Rule</h1>
          </div>
          <button className="action-btn back-dashboard" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="add-price-form" onSubmit={handleSubmit}>
          <div className="form-grid two-col">
            <div className="form-field">
              <label htmlFor="ruleName">Rule Name</label>
              <input
                id="ruleName"
                name="ruleName"
                type="text"
                value={formData.ruleName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="receiverId">TPA/Receiver ID</label>
              <select
                id="receiverId"
                name="receiverId"
                value={formData.receiverId}
                onChange={handleInputChange}
              >
                <option value="">Select Receiver</option>
                <option value="receiver-1">Receiver 1</option>
                <option value="receiver-2">Receiver 2</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="healthPlan">Health Plan</label>
              <select
                id="healthPlan"
                name="healthPlan"
                value={formData.healthPlan}
                onChange={handleInputChange}
              >
                <option value="">Select Health Plan</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="priceListName">Price List Name</label>
              <select
                id="priceListName"
                name="priceListName"
                value={formData.priceListName}
                onChange={handleInputChange}
              >
                <option value="">Select Price List</option>
                <option value="list-1">Price List 1</option>
                <option value="list-2">Price List 2</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="codeType">Code Type</label>
              <select
                id="codeType"
                name="codeType"
                value={formData.codeType}
                onChange={handleInputChange}
              >
                <option value="">Select Code Type</option>
                <option value="icd">ICD</option>
                <option value="cpt">CPT</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="activityType">Activity Type</label>
              <select
                id="activityType"
                name="activityType"
                value={formData.activityType}
                onChange={handleInputChange}
              >
                <option value="">Select Activity Type</option>
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="operandTypeCode">Operand Type Code</label>
              <select
                id="operandTypeCode"
                name="operandTypeCode"
                value={formData.operandTypeCode}
                onChange={handleInputChange}
              >
                <option value="">Select Rule</option>
                <option value="rule-1">Rule 1</option>
                <option value="rule-2">Rule 2</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="operatorTypeCode">Operator Type Code</label>
              <select
                id="operatorTypeCode"
                name="operatorTypeCode"
                value={formData.operatorTypeCode}
                onChange={handleInputChange}
              >
                <option value="">Select Rule</option>
                <option value="rule-a">Rule A</option>
                <option value="rule-b">Rule B</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="discountValue">Discount Value</label>
              <input
                id="discountValue"
                name="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="beginEffectiveDate">Begin Effected date</label>
              <input
                id="beginEffectiveDate"
                name="beginEffectiveDate"
                type="text"
                placeholder="dd-MMM-yy"
                pattern="\\d{2}-[A-Za-z]{3}-\\d{2}"
                value={formData.beginEffectiveDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="endEffectiveDate">End Effected date</label>
              <input
                id="endEffectiveDate"
                name="endEffectiveDate"
                type="text"
                placeholder="dd-MMM-yy"
                pattern="\\d{2}-[A-Za-z]{3}-\\d{2}"
                value={formData.endEffectiveDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-field file-field">
            <label htmlFor="bulkRuleFile">File</label>
            <div className="file-control">
              <input id="bulkRuleFile" type="file" onChange={handleFileChange} />
              <span>{selectedFileName}</span>
            </div>
            <button type="button" className="upload-btn">Upload bulk data</button>
          </div>

          <div className="json-preview-section">
            <h3>JSON Request Body Preview</h3>
            <pre>{JSON.stringify(requestBodyPreview, null, 2)}</pre>
          </div>

          <div className="submit-row">
            <button type="submit" className="action-btn primary-btn">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPriceRule;