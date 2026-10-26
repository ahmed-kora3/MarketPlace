/**
 * ProductDetailsPage.jsx
 *
 * Full-page product detail view. Accessed via /products/:id.
 *
 * Features:
 *  - Breadcrumb navigation
 *  - Category-aware artwork (no real product images in current API)
 *  - Product name, price, stock status
 *  - Seller name
 *  - Full description
 *  - Quantity selector (respects available stock)
 *  - Add-to-cart action with feedback toast
 *  - Favorite action
 *  - Clear back-to-catalog link
 *
 * Data flow:
 *  products are passed in from App.jsx (already loaded).
 *  The route /products/:id uses useParams() to find the product.
 *
 * Limitations:
 *  - No real product image (API does not expose an image URL field).
 *  - Related products section not implemented (no API endpoint).
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Heart,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import ProductArtwork from "../components/products/ProductArtwork";
import { LoadingState } from "../components/common/StateComponents";
import { apiClient } from "../services/apiClient";
import { formatPrice } from "../utils/formatters";

/* ── Inline toast notification ───────────────────────────── */

function Toast({ message, visible }) {
  return (
    <div
      className={`product-toast${visible ? " product-toast--visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

export default function ProductDetailsPage(props) {
  const { id } = useParams();

  return <ProductDetailsContent key={id} id={id} {...props} />;
}

function ProductDetailsContent({
  id,
  onAddToCart,
  favorites,
  onFavorite,
}) {
  const navigate   = useNavigate();
  const [requestState, setRequestState] = useState({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast]         = useState({ message: "", visible: false });
  const toastTimerRef             = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    apiClient
      .get(`/products/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((product) => {
        if (!active || controller.signal.aborted) return;

        if (product?.is_archived === true) {
          setRequestState({ status: "not-found" });
          return;
        }

        if (
          !product ||
          typeof product !== "object" ||
          String(product.id) !== String(id)
        ) {
          setRequestState({
            status: "error",
            kind: "api",
            message: "استجابة تفاصيل المنتج غير صالحة.",
          });
          return;
        }

        setRequestState({ status: "success", product });
      })
      .catch((error) => {
        if (!active || controller.signal.aborted) return;

        if (error?.status === 404) {
          setRequestState({ status: "not-found" });
          return;
        }

        setRequestState({
          status: "error",
          kind: error instanceof TypeError ? "network" : "api",
          message:
            error instanceof TypeError
              ? "تعذر الاتصال بالمتجر. تحقق من اتصالك وحاول مرة أخرى."
              : error instanceof Error
                ? error.message
                : "حدث خطأ أثناء تحميل تفاصيل المنتج.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, retryCount]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const product =
    requestState.status === "success" ? requestState.product : null;
  const isFavorite = favorites?.includes(product?.id);

  const showToast = (message) => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, visible: true });
    toastTimerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2800
    );
  };

  /* ── Loading ── */
  if (requestState.status === "loading") {
    return (
      <main className="section-container pdp-loading" dir="rtl">
        <LoadingState message="جاري تحميل المنتج..." />
      </main>
    );
  }

  /* ── Not found ── */
  if (requestState.status === "not-found") {
    return (
      <main className="section-container pdp-not-found" dir="rtl">
        <div className="pdp-not-found__inner">
          <Package size={48} strokeWidth={1.2} aria-hidden="true" />
          <h2>المنتج غير موجود</h2>
          <p>ربما تم حذف هذا المنتج أو أن الرابط غير صحيح.</p>
          <button className="btn btn--primary" onClick={() => navigate("/")}>
            <ArrowLeft size={16} aria-hidden="true" />
            العودة للمتجر
          </button>
        </div>
      </main>
    );
  }

  if (requestState.status === "error") {
    const isNetworkError = requestState.kind === "network";

    return (
      <main className="section-container pdp-loading" dir="rtl">
        <div className="error-panel" role="alert" aria-live="assertive">
          <AlertCircle size={24} aria-hidden="true" />
          <div className="error-panel__body">
            <strong className="error-panel__title">
              {isNetworkError ? "تعذر الاتصال بالمتجر" : "تعذر تحميل المنتج"}
            </strong>
            <p className="error-panel__message">{requestState.message}</p>
          </div>
          <button
            className="btn btn--outline btn--sm error-panel__retry"
            onClick={() => {
              setRequestState({ status: "loading" });
              setRetryCount((count) => count + 1);
            }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  const stock  = Math.max(0, Number(product.stock) || 0);
  const safeQty = Math.min(quantity, Math.max(stock, 1));
  const totalPrice = Number(product.price) * safeQty;

  const handleAddToCart = () => {
    const result = onAddToCart?.(product, safeQty);

    if (result === "out_of_stock") {
      showToast("⚠️ المنتج غير متوفر في المخزون.");
    } else if (result === "updated") {
      showToast("✅ تمت زيادة الكمية في السلة.");
    } else {
      showToast("✅ تمت الإضافة إلى السلة.");
    }
  };

  return (
    <main className="pdp section-container" dir="rtl" aria-label={product.name}>
      <Toast message={toast.message} visible={toast.visible} />

      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb" aria-label="مسار التنقل">
        <Link to="/">الرئيسية</Link>
        <span aria-hidden="true"> / </span>
        {product.category && (
          <>
            <span>{product.category.name}</span>
            <span aria-hidden="true"> / </span>
          </>
        )}
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pdp-layout">
        {/* Image column */}
        <div className="pdp-artwork-col">
          <ProductArtwork product={product} large />

          {/* Favorite */}
          <button
            className={`pdp-favorite-btn${isFavorite ? " is-favorite" : ""}`}
            onClick={() => onFavorite?.(product.id)}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            aria-pressed={isFavorite}
          >
            <Heart
              size={18}
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
            {isFavorite ? "في المفضلة" : "أضف للمفضلة"}
          </button>
        </div>

        {/* Info column */}
        <div className="pdp-info-col">
          {/* Category */}
          <span className="pdp-category eyebrow">
            {product.category?.name || "منتجات يدوية"}
          </span>

          <h1 className="pdp-title">{product.name}</h1>

          {/* Seller */}
          {product.seller?.name && (
            <p className="pdp-seller">
              <span className="seller-dot" aria-hidden="true" />
              {product.seller.name}
            </p>
          )}

          {/* Price */}
          <div className="pdp-price-block">
            <span className="pdp-price" dir="ltr">
              {formatPrice(product.price)}
            </span>
            <span className="pdp-currency">وحدة نقدية</span>
          </div>

          {/* Stock */}
          <div className={`pdp-stock${stock > 0 ? " pdp-stock--in" : " pdp-stock--out"}`}>
            <span className="stock-dot" aria-hidden="true" />
            {stock > 0
              ? `متوفر في المخزون: ${stock} قطعة${stock <= 5 ? " — كمية محدودة" : ""}`
              : "غير متوفر حاليًا"}
          </div>

          {/* Description */}
          {product.description && (
            <p className="pdp-description">{product.description}</p>
          )}

          <hr className="pdp-divider" />

          {/* Quantity selector */}
          {stock > 0 && (
            <div className="pdp-quantity-row">
              <label className="pdp-quantity-label" htmlFor="pdp-qty">
                الكمية
              </label>

              <div className="quantity-control" role="group" aria-label="اختر الكمية">
                <button
                  className="quantity-control__btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={safeQty <= 1}
                  aria-label="تقليل الكمية"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>

                <span
                  id="pdp-qty"
                  className="quantity-control__value"
                  aria-live="polite"
                >
                  {safeQty}
                </span>

                <button
                  className="quantity-control__btn"
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={safeQty >= stock}
                  aria-label="زيادة الكمية"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>

              <span className="pdp-quantity-total" dir="ltr">
                الإجمالي: <strong>{formatPrice(totalPrice)}</strong>
              </span>
            </div>
          )}

          {/* CTA */}
          <button
            className="btn btn--primary pdp-add-to-cart"
            disabled={stock === 0}
            onClick={handleAddToCart}
            aria-label={`أضف ${safeQty} من ${product.name} إلى السلة`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {stock === 0 ? "غير متوفر" : "أضف إلى السلة"}
          </button>

          <p className="pdp-note">
            يمكنك مراجعة المنتجات والكميات من صفحة السلة قبل إتمام الطلب.
          </p>
        </div>
      </div>
    </main>
  );
}
