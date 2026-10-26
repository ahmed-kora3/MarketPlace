/**
 * CartPage.jsx
 *
 * Dedicated cart page replacing the previous browser alert().
 *
 * Displays:
 *  - Each cart item with name, category, price, quantity controls
 *  - Remove button per item
 *  - Subtotal and grand total
 *  - Empty cart illustration
 *  - Navigation back to the product catalog
 *
 * NOTE: This cart is localStorage-only. Backend sync (POST /api/v1/buyer/cart)
 * requires authentication which is not yet implemented in the frontend.
 * This is a documented limitation — see ARCHITECTURE.md.
 */

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatters";

export default function CartPage({ cartItems, onUpdateQuantity, onRemove, onClear }) {
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (cartItems.length === 0) {
    return (
      <main className="cart-page section-container" dir="rtl" aria-label="سلة التسوق">
        <div className="cart-empty">
          <span className="cart-empty__icon" aria-hidden="true">
            <ShoppingBag size={40} strokeWidth={1.4} />
          </span>
          <h2 className="cart-empty__title">سلتك فارغة</h2>
          <p className="cart-empty__desc">
            لم تضف أي منتجات بعد. تصفح مجموعتنا واختر ما يعجبك.
          </p>
          <Link to="/" className="btn btn--primary">
            اكتشف المنتجات
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page section-container" dir="rtl" aria-label="سلة التسوق">
      <div className="cart-header">
        <h1 className="cart-title">
          <ShoppingBag size={24} aria-hidden="true" />
          سلة التسوق
          <span className="cart-count-badge">{cartItems.reduce((s, i) => s + Number(i.quantity), 0)} منتج</span>
        </h1>
        <Link to="/" className="btn btn--ghost btn--sm">
          ← متابعة التسوق
        </Link>
      </div>

      <div className="cart-layout">
        {/* Items list */}
        <section className="cart-items" aria-label="منتجات السلة">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </section>

        {/* Summary */}
        <aside className="cart-summary" aria-label="ملخص الطلب">
          <h2 className="cart-summary__title">ملخص الطلب</h2>

          <div className="cart-summary__rows">
            {cartItems.map((item) => (
              <div className="cart-summary__row" key={item.id}>
                <span className="cart-summary__item-name">{item.name}</span>
                <span className="cart-summary__item-price" dir="ltr">
                  {formatPrice(Number(item.price) * Number(item.quantity))}
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary__total">
            <span>الإجمالي</span>
            <strong dir="ltr">{formatPrice(total)}</strong>
          </div>

          <p className="cart-summary__note">
            سيتم احتساب التوصيل عند إتمام الطلب.
          </p>

          {/* Checkout is not yet implemented — button is intentionally
              disabled and clearly labelled to avoid misleading the user. */}
          <button
            className="btn btn--primary cart-summary__checkout"
            disabled
            aria-label="إتمام الشراء — غير متاح حالياً، يتطلب تسجيل الدخول"
            title="يتطلب تسجيل الدخول"
          >
            إتمام الشراء
            <span className="cart-checkout-note">(يتطلب تسجيل الدخول)</span>
          </button>

          <button
            className="btn btn--ghost btn--sm cart-summary__clear"
            onClick={onClear}
          >
            <Trash2 size={14} aria-hidden="true" />
            إفراغ السلة
          </button>
        </aside>
      </div>
    </main>
  );
}

/* ── CartItem sub-component ──────────────────────────────── */

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const stock = Number(item.stock) || 0;
  const qty   = Number(item.quantity) || 1;

  return (
    <div className="cart-item" role="listitem">
      <div className="cart-item__info">
        <span className="cart-item__name">{item.name}</span>
        {item.category && (
          <span className="cart-item__category">{item.category}</span>
        )}
        <span className="cart-item__unit-price" dir="ltr">
          {formatPrice(item.price)} / وحدة
        </span>
      </div>

      <div className="cart-item__controls">
        {/* Quantity */}
        <div className="quantity-control" role="group" aria-label={`كمية ${item.name}`}>
          <button
            className="quantity-control__btn"
            onClick={() => onUpdateQuantity(item.id, qty - 1)}
            disabled={qty <= 1}
            aria-label="تقليل الكمية"
          >
            <Minus size={14} aria-hidden="true" />
          </button>

          <span className="quantity-control__value" aria-live="polite">
            {qty}
          </span>

          <button
            className="quantity-control__btn"
            onClick={() => onUpdateQuantity(item.id, qty + 1)}
            disabled={qty >= stock}
            aria-label="زيادة الكمية"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Item total */}
        <span className="cart-item__total" dir="ltr">
          {formatPrice(Number(item.price) * qty)}
        </span>

        {/* Remove */}
        <button
          className="cart-item__remove btn btn--ghost btn--icon"
          onClick={() => onRemove(item.id)}
          aria-label={`إزالة ${item.name} من السلة`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
