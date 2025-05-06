import React from 'react';
import './ClearHistoryModal.css';

const ClearHistoryModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  theme
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target.className.includes('modal-overlay')) {
      onClose();
    }
  };

  const themeClass = theme === 'dark' ? 'theme-dark' : 'theme-light';

  return (
    <div className={`modal-overlay ${themeClass}`} onClick={handleOverlayClick}>
      <div className="confirmation-modal">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-button cancel-button" onClick={onClose}>
            {cancelText}
          </button>
          <button className="modal-button confirm-button" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearHistoryModal; 