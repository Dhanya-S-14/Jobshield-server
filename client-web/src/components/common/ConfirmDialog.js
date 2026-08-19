import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="400px">
      <div className="confirm-dialog">
        <div className={`confirm-icon ${variant === 'danger' ? 'danger' : 'warning'}`}>
          <FiAlertTriangle />
        </div>
        <h3>{title || 'Are you sure?'}</h3>
        <p>{message || 'This action cannot be undone.'}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText || 'Cancel'}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
