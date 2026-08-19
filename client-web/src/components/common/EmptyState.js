import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, message, actionText, actionLink, onAction }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || <FiInbox />}</div>
      <h3>{title || 'Nothing here yet'}</h3>
      <p>{message || 'No items to display.'}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">{actionText}</Link>
      )}
      {actionText && onAction && !actionLink && (
        <button className="btn btn-primary" onClick={onAction}>{actionText}</button>
      )}
    </div>
  );
};

export default EmptyState;
