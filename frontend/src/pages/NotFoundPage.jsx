/**
 * NotFoundPage.jsx
 *
 * 404 fallback page for unmatched routes.
 */

import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main
      className="not-found section-container"
      dir="rtl"
      aria-label="الصفحة غير موجودة"
    >
      <div className="not-found__inner">
        <SearchX size={52} strokeWidth={1.2} aria-hidden="true" />
        <h1 className="not-found__code">404</h1>
        <h2 className="not-found__title">الصفحة غير موجودة</h2>
        <p className="not-found__desc">
          الرابط الذي فتحته غير صحيح أو لم يعد متاحًا.
        </p>
        <Link to="/" className="btn btn--primary">
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </main>
  );
}
