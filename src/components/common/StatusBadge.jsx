import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`status-badge ${normalized}`}>
      <span className="status-dot" aria-hidden="true"></span>
      <span>{status}</span>
    </span>
  );
}
