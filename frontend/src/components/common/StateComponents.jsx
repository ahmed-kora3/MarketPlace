/**
 * common/index.jsx  ←  lightweight common state components
 *
 * ErrorState   — displayed when an API call fails
 * EmptyState   — displayed when no results match filters
 * LoadingState — simple text fallback (use ProductSkeleton for grids)
 */

import { AlertCircle, RefreshCw, Search } from "lucide-react";

/* ── Error state ──────────────────────────────────────────── */

export function ErrorState({ message, apiUrl, onRetry }) {
  return (
    <div className="error-panel" role="alert" aria-live="assertive">
      <AlertCircle size={24} aria-hidden="true" />

      <div className="error-panel__body">
        <strong className="error-panel__title">فيه مشكلة في الاتصال</strong>
        <p className="error-panel__message">{message}</p>
        {apiUrl && (
          <small className="error-panel__url" dir="ltr">
            {apiUrl}
          </small>
        )}
      </div>

      {onRetry && (
        <button className="btn btn--outline btn--sm error-panel__retry" onClick={onRetry}>
          <RefreshCw size={14} aria-hidden="true" />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────── */

export function EmptyState({ title, description, onReset }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Search size={28} />
      </span>

      <h3 className="empty-state__title">{title || "لا توجد نتائج"}</h3>
      {description && <p className="empty-state__desc">{description}</p>}

      {onReset && (
        <button className="btn btn--primary btn--sm" onClick={onReset}>
          عرض كل المنتجات
        </button>
      )}
    </div>
  );
}

/* ── Loading state (text fallback) ───────────────────────── */

export function LoadingState({ message = "جاري التحميل..." }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
