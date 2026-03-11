import React from 'react';
import styles from './index.module.css';

export function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`${styles.spinner} ${styles[`spinner--${size}`]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className={styles.errorTitle}>{title}</h3>
      {message && <p className={styles.errorMsg}>{message}</p>}
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    Present: styles.badgeGreen,
    Absent: styles.badgeRed,
    Engineering: styles.badgeBlue,
    Marketing: styles.badgePurple,
    Sales: styles.badgeAmber,
    HR: styles.badgePink,
    Finance: styles.badgeTeal,
    Operations: styles.badgeOrange,
    Design: styles.badgeCyan,
    Legal: styles.badgeGray,
    Other: styles.badgeGray,
  };
  return (
    <span className={`${styles.badge} ${map[status] || styles.badgeGray}`}>
      {status}
    </span>
  );
}

export function StatCard({ label, value, icon, color = 'blue', trend }) {
  return (
    <div className={`${styles.statCard} ${styles[`statCard--${color}`]}`}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        {icon && <span className={styles.statIcon}>{icon}</span>}
      </div>
      <div className={styles.statValue}>{value ?? '—'}</div>
      {trend && <div className={styles.statTrend}>{trend}</div>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.confirmMsg}>{message}</p>
          <div className={styles.confirmActions}>
            <button className={styles.btnSecondary} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className={styles.btnDanger} onClick={onConfirm} disabled={loading}>
              {loading ? <Spinner size="sm" /> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
