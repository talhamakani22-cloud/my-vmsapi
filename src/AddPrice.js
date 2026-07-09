import { useEffect, useState } from 'react';
import './AddPrice.css';

const STORAGE_KEY = 'addPriceRecords';
const REQUEST_BODIES_KEY = 'addPriceRequestBodies';

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

function AddPrice({
  onBackToDashboard,
  isPopup = false,
  onClose,
  onSubmitSuccess,
  initialData = null,
  editIndex = null,
}) {
  const [formData, setFormData] = useState({
    serviceCode: '',
    priceItemName: '',
    receiverId: '',
    healthPlan: '',
    codeType: '',
    finClass: '',
    priceListName: '',
    grossPrice: '',
    beginEffectiveDate: '',
    endEffectiveDate: '',
    exclusionFlagType: '',
    preApprovedFlag: '',
    confirm: false,
  });

  const [selectedFileName, setSelectedFileName] = useState('No file chosen');

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      serviceCode: initialData.serviceCode || '',
      priceItemName: initialData.priceItemName || '',
      receiverId: initialData.receiverId || '',
      healthPlan: initialData.healthPlan || '',
      codeType: initialData.codeType || '',
      finClass: initialData.finClass || '',
      priceListName: initialData.priceListName || '',
      grossPrice: initialData.grossPrice || '',
      beginEffectiveDate: initialData.beginEffectiveDate || '',
      endEffectiveDate: initialData.endEffectiveDate || '',
      exclusionFlagType: initialData.exclusionFlagType || '',
      preApprovedFlag: initialData.preApprovedFlag || '',
      confirm: Boolean(initialData.confirm),
    });
    setSelectedFileName(initialData.fileName || 'No file chosen');
  }, [initialData]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previousState) => ({
      ...previousState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFileName(file ? file.name : 'No file chosen');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requestBody = {
      healthplanid: formData.healthPlan || '0',
      receiverid: formData.receiverId,
      codetype: formData.codeType,
      payerid: '0',
      finclasscode: formData.finClass,
      pricerule: formData.priceListName || '0',
      begeff: formatDateForBody(formData.beginEffectiveDate),
      endeff: formatDateForBody(formData.endEffectiveDate),
      servicecode: formData.serviceCode,
      grossprice: formData.grossPrice,
      priceitemname: formData.priceItemName,
      excflag: formData.exclusionFlagType || '0',
      preflag: formData.preApprovedFlag || '0',
    };

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
      {!isPopup && (
        <div className="bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
      )}

      <div className="add-price-shell">
        <div className="add-price-header-row">
          <div>
            <h1>Add Price</h1>
          </div>
          {isPopup ? (
            <button className="action-btn back-dashboard" onClick={onClose}>
              Close
            </button>
          ) : (
            <button className="action-btn back-dashboard" onClick={onBackToDashboard}>
              Back to Dashboard
            </button>
          )}
        </div>

        <form className="add-price-form" onSubmit={handleSubmit}>
          <div className="form-grid two-col">
            <div className="form-field">
              <label htmlFor="serviceCode">Service Code</label>
              <input
                id="serviceCode"
                name="serviceCode"
                type="text"
                value={formData.serviceCode}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="priceItemName">Price item name</label>
              <input
                id="priceItemName"
                name="priceItemName"
                type="text"
                value={formData.priceItemName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <div className="inline-label-row">
                <label htmlFor="receiverId">TPA/ Receiver ID</label>
                <button type="button" className="download-btn">Download price list</button>
              </div>
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
              <label htmlFor="finClass">Fin Class</label>
              <select
                id="finClass"
                name="finClass"
                value={formData.finClass}
                onChange={handleInputChange}
              >
                <option value="">Select Finclass</option>
                <option value="class-a">Class A</option>
                <option value="class-b">Class B</option>
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
              <label htmlFor="grossPrice">Gross Price</label>
              <input
                id="grossPrice"
                name="grossPrice"
                type="number"
                value={formData.grossPrice}
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

            <div className="form-field">
              <label htmlFor="exclusionFlagType">Exclusion Flag Type</label>
              <select
                id="exclusionFlagType"
                name="exclusionFlagType"
                value={formData.exclusionFlagType}
                onChange={handleInputChange}
              >
                <option value="">Select Flag Type</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="preApprovedFlag">Pre Approved Flag</label>
              <select
                id="preApprovedFlag"
                name="preApprovedFlag"
                value={formData.preApprovedFlag}
                onChange={handleInputChange}
              >
                <option value="">Select Flag Type</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="form-field file-field">
            <label htmlFor="bulkFile">File</label>
            <div className="file-control">
              <input id="bulkFile" type="file" onChange={handleFileChange} />
              <span>{selectedFileName}</span>
            </div>
            <button type="button" className="upload-btn">Upload bulk data</button>
          </div>

          <div className="confirm-row">
            <label className="confirm-checkbox" htmlFor="confirm">
              <input
                id="confirm"
                name="confirm"
                type="checkbox"
                checked={formData.confirm}
                onChange={handleInputChange}
              />
              <span>Please Confirm</span>
            </label>
          </div>

          <div className="submit-row">
            <button type="submit" className="action-btn primary-btn">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPrice;