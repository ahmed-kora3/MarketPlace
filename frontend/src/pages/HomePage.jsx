/**
 * HomePage.jsx
 *
 * The main landing page of حِرفة Handmade Market.
 *
 * Sections (in order):
 *  1. Hero — brand statement and primary CTA
 *  2. Benefits strip — four trust/quality points
 *  3. Categories — from real API data
 *  4. Product catalog — with search, filters, and sorting
 *  5. Craft banner — secondary CTA
 *
 * Props:
 *  products         — array from API
 *  categories       — array from API
 *  loading          — boolean
 *  error            — string | ""
 *  onReload         — function to retry the API
 *  favorites        — array of favorited product IDs
 *  onFavorite       — (id) => void
 *  onAddToCart      — (product, qty) => string  ("added"|"updated"|"out_of_stock")
 *  catalogRef       — React ref forwarded to the #products section
 */

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
  ArrowUpDown,
} from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import ProductSkeleton from "../components/products/ProductSkeleton";
import { ErrorState, EmptyState } from "../components/common/StateComponents";
import { getCategoryArt } from "../utils/formatters";
import { apiClient } from "../services/apiClient";

export default function HomePage({
  products,
  categories,
  loading,
  error,
  onReload,
  favorites,
  onFavorite,
}) {
  /* ── Filter / sort state ── */
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort,     setSort]     = useState("newest");

  const productsRef = useRef(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  const hasActiveFilters =
    search !== "" ||
    category !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sort !== "newest";

  /* ── Filtered + sorted product list ── */
  const filteredProducts = useMemo(() => {
    let list = [...products];
    const term = search.trim().toLowerCase();

    if (term) {
      list = list.filter((p) =>
        [p.name, p.description, p.category?.name, p.seller?.name]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term))
      );
    }

    if (category !== "all") {
      list = list.filter(
        (p) => String(p.category?.id) === String(category)
      );
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (minPrice !== "" && Number.isFinite(min)) {
      list = list.filter((p) => Number(p.price) >= min);
    }
    if (maxPrice !== "" && Number.isFinite(max)) {
      list = list.filter((p) => Number(p.price) <= max);
    }

    if (sort === "price-low") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    } else {
      // newest first
      list.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return list;
  }, [products, search, category, minPrice, maxPrice, sort]);

  return (
    <div className="app-shell" dir="rtl">
      {/* ═══════════════════════════════ HERO ═════════════════════════ */}
      <section className="hero" id="home" aria-labelledby="hero-heading">
        <div className="hero-decoration hero-decoration--one" aria-hidden="true" />
        <div className="hero-decoration hero-decoration--two" aria-hidden="true" />

        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="kicker-line" aria-hidden="true" />
            <span>صُنع بشغف، اختير بعناية</span>
          </div>

          <h1 id="hero-heading">
            مش مجرد منتج،
            <br />
            <span>دي حكاية حِرفة.</span>
          </h1>

          <p>
            اكتشف قطعًا فريدة صنعتها أيادٍ مبدعة. تفاصيل صغيرة،
            وشغف كبير، وقطع تضيف روحًا خاصة لكل مكان.
          </p>

          <div className="hero-actions">
            <button className="btn btn--primary btn--lg" onClick={scrollToProducts}>
              اكتشف المجموعة
              <ArrowLeft size={18} aria-hidden="true" />
            </button>

            <a href="#categories" className="text-link">
              تصفح الأقسام
              <ArrowLeft size={15} aria-hidden="true" />
            </a>
          </div>

          <div className="hero-social-proof" aria-label="ملاحظة عن المتجر">
            <div className="avatar-stack" aria-hidden="true">
              <span>🎨</span>
              <span>🧵</span>
              <span>🪴</span>
            </div>
            <div>
              <strong>صناعة مستقلة وإبداع حقيقي</strong>
              <small>كل قطعة تحمل طابعها الخاص</small>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-art-card hero-art-back">
            <span>✦</span>
          </div>
          <div className="hero-art-card hero-art-front">
            <span className="hero-pot">🏺</span>
            <span className="hero-art-label">MADE BY HAND</span>
          </div>
          <div className="floating-note floating-note--top">
            <Sparkles size={15} />
            <span>تفاصيل فريدة</span>
          </div>
          <div className="floating-note floating-note--bottom">
            <span>❤️</span>
            <span>صنع بحب</span>
          </div>
          <span className="hero-star hero-star--one" aria-hidden="true">✳</span>
          <span className="hero-star hero-star--two" aria-hidden="true">✦</span>
        </div>
      </section>

      {/* ═══════════════════════════ BENEFITS STRIP ═══════════════════ */}
      <div className="benefits-strip" id="about" aria-label="مزايا المتجر">
        <div className="benefit-item">
          <span className="benefit-icon" aria-hidden="true"><Sparkles size={20} /></span>
          <div>
            <strong>قطع مميزة</strong>
            <small>اختيارات لها شخصية</small>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon" aria-hidden="true"><ShieldCheck size={20} /></span>
          <div>
            <strong>صناع مستقلون</strong>
            <small>ندعم المواهب المحلية</small>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon" aria-hidden="true"><Package size={20} /></span>
          <div>
            <strong>تفاصيل مدروسة</strong>
            <small>كل قطعة مختلفة</small>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon" aria-hidden="true"><Truck size={20} /></span>
          <div>
            <strong>تجربة سهلة</strong>
            <small>تصفح واكتشف منتجاتنا</small>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════ CATEGORIES ═══════════════════════ */}
      <section
        className="categories-section section-container"
        id="categories"
        aria-labelledby="categories-heading"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">تسوق حسب ذوقك</span>
            <h2 id="categories-heading">
              مساحة لكل <span>إبداع</span>
            </h2>
            <p>اختار القسم اللي يشبهك واكتشف تفاصيله.</p>
          </div>

          <button className="text-link section-link" onClick={scrollToProducts}>
            كل المنتجات <ArrowLeft size={16} aria-hidden="true" />
          </button>
        </div>

        {loading && categories.length === 0 ? (
          <div className="category-loading" role="status">جاري تحميل الأقسام...</div>
        ) : (
          <div className="category-grid">
            {/* "All" button */}
            <button
              className={`category-card category-card--all${category === "all" ? " category-card--selected" : ""}`}
              onClick={() => { setCategory("all"); scrollToProducts(); }}
              aria-pressed={category === "all"}
            >
              <span className="category-art category-art--all" aria-hidden="true">✦</span>
              <span className="category-card-text">
                <strong>كل المنتجات</strong>
                <small>اكتشف المجموعة كاملة</small>
              </span>
              <ArrowLeft size={16} className="category-arrow" aria-hidden="true" />
            </button>

            {categories.map((cat) => {
              const art = getCategoryArt(cat);
              const isSelected = category === String(cat.id);
              return (
                <button
                  key={cat.id}
                  className={`category-card${isSelected ? " category-card--selected" : ""}`}
                  onClick={() => { setCategory(String(cat.id)); scrollToProducts(); }}
                  aria-pressed={isSelected}
                  aria-label={cat.name}
                >
                  <span className={`category-art ${art.className}`} aria-hidden="true">
                    {art.icon}
                  </span>
                  <span className="category-card-text">
                    <strong>{cat.name}</strong>
                    <small>{cat.description || "اكتشف منتجات هذا القسم"}</small>
                  </span>
                  <ArrowLeft size={16} className="category-arrow" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════ PRODUCTS ═════════════════════════ */}
      <section
        className="products-section section-container"
        id="products"
        ref={productsRef}
        aria-labelledby="products-heading"
      >
        <div className="section-heading products-heading">
          <div>
            <span className="eyebrow">اختياراتنا لك</span>
            <h2 id="products-heading">
              اكتشف <span>المنتجات</span>
            </h2>
            <p>قطع فريدة من صناع عندهم شغف بالتفاصيل.</p>
          </div>

          {!loading && (
            <div className="results-count" aria-live="polite">
              <span>{filteredProducts.length}</span> منتج
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="catalog-toolbar" role="search" aria-label="بحث وفلترة المنتجات">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="بتدور على إيه؟"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="ابحث في المنتجات"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="مسح البحث"
                className="search-clear-btn"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="toolbar-filters">
            <label className="filter-select">
              <SlidersHorizontal size={16} aria-hidden="true" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="تصفية حسب القسم"
              >
                <option value="all">كل الأقسام</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-select">
              <ArrowUpDown size={16} aria-hidden="true" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="ترتيب المنتجات"
              >
                <option value="newest">الأحدث أولًا</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="name">الاسم</option>
              </select>
            </label>
          </div>
        </div>

        {/* Price filter */}
        <div className="price-filter-row" role="group" aria-label="فلتر السعر">
          <span>نطاق السعر:</span>

          <label>
            <span>من</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="الحد الأدنى للسعر"
            />
          </label>

          <label>
            <span>إلى</span>
            <input
              type="number"
              min="0"
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="الحد الأقصى للسعر"
            />
          </label>

          {hasActiveFilters && (
            <button className="reset-filters btn btn--ghost btn--sm" onClick={resetFilters}>
              <RotateCcw size={13} aria-hidden="true" />
              إعادة ضبط
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <ErrorState
            message={error}
            apiUrl={apiClient.baseUrl}
            onRetry={onReload}
          />
        )}

        {/* Loading skeleton */}
        {loading && <ProductSkeleton count={8} />}

        {/* Empty */}
        {!loading && !error && filteredProducts.length === 0 && (
          <EmptyState
            title="ملقيناش منتجات مطابقة"
            description="جرّب كلمة بحث مختلفة أو غيّر الفلاتر."
            onReset={resetFilters}
          />
        )}

        {/* Product grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid" role="list" aria-label="قائمة المنتجات">
            {filteredProducts.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onFavorite={onFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════ CRAFT BANNER ══════════════════════ */}
      <section className="craft-banner section-container" aria-labelledby="craft-heading">
        <div className="craft-banner__symbol" aria-hidden="true">✳</div>

        <div className="craft-banner__copy">
          <span className="eyebrow">وراء كل قطعة حكاية</span>
          <h2 id="craft-heading">الجمال في التفاصيل الصغيرة.</h2>
          <p>اكتشف منتجات اتعملت بشغف، واتصممت علشان تعيش معاك.</p>
        </div>

        <button className="craft-banner__btn" onClick={scrollToProducts}>
          اكتشف المنتجات
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
