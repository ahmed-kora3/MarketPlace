import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Heart,
  ArrowLeft,
  ArrowUpDown,
  SlidersHorizontal,
  Sparkles,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import "./index.css";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const categoryArt = {
  jewelry: { icon: "💍", className: "art-jewelry" },
  pottery: { icon: "🏺", className: "art-pottery" },
  paintings: { icon: "🎨", className: "art-paintings" },
  textiles: { icon: "🧶", className: "art-textiles" },
  woodwork: { icon: "🪵", className: "art-woodwork" },
};

const defaultArt = { icon: "✨", className: "art-default" };

async function apiGet(path, signal) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed (${response.status})`
    );
  }

  if (result.status === "Error") {
    throw new Error(result.message || "حدث خطأ أثناء تحميل البيانات.");
  }

  return result.data ?? result;
}

function getArt(category) {
  const slug = (category?.slug || "").toLowerCase();
  const name = (category?.name || "").toLowerCase();

  for (const key of Object.keys(categoryArt)) {
    if (slug.includes(key) || name.includes(key)) {
      return categoryArt[key];
    }
  }

  if (name.includes("فخار") || name.includes("خزف")) {
    return categoryArt.pottery;
  }

  if (name.includes("مجوهر") || name.includes("حلي")) {
    return categoryArt.jewelry;
  }

  if (name.includes("لوح") || name.includes("رسم")) {
    return categoryArt.paintings;
  }

  if (name.includes("نسيج") || name.includes("خيوط")) {
    return categoryArt.textiles;
  }

  if (name.includes("خشب")) {
    return categoryArt.woodwork;
  }

  return defaultArt;
}

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function ProductArtwork({ product, large = false }) {
  const art = getArt(product.category);

  return (
    <div
      className={`product-art ${art.className} ${
        large ? "product-art-large" : ""
      }`}
      aria-label={`رسم توضيحي لفئة ${
        product.category?.name || "المنتج"
      }`}
    >
      <span className="art-orbit art-orbit-one" />
      <span className="art-orbit art-orbit-two" />
      <span className="art-sparkle sparkle-one">✦</span>
      <span className="art-sparkle sparkle-two">✧</span>
      <span className="art-emoji">{art.icon}</span>
      <span className="art-caption">HANDMADE WITH LOVE</span>
    </div>
  );
}

function ProductCard({ product, onOpen, favorites, onFavorite }) {
  const isFavorite = favorites.includes(product.id);

  return (
    <article className="product-card">
      <button
        className={`favorite-button ${
          isFavorite ? "is-favorite" : ""
        }`}
        onClick={(event) => {
          event.stopPropagation();
          onFavorite(product.id);
        }}
        aria-label={
          isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"
        }
      >
        <Heart
          size={18}
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>

      <button
        className="product-image-button"
        onClick={() => onOpen(product)}
        aria-label={`عرض ${product.name}`}
      >
        <ProductArtwork product={product} />

        {Number(product.stock) > 0 &&
          Number(product.stock) <= 5 && (
            <span className="stock-badge">كمية محدودة</span>
          )}

        {Number(product.stock) <= 0 && (
          <span className="stock-badge out-of-stock">
            نفد المخزون
          </span>
        )}
      </button>

      <div className="product-info">
        <div className="product-category">
          {product.category?.name || "منتجات يدوية"}
        </div>

        <button
          className="product-title"
          onClick={() => onOpen(product)}
        >
          {product.name}
        </button>

        <div className="product-seller">
          <span className="seller-dot" />
          {product.seller?.name || "صانع مستقل"}
        </div>

        <div className="product-bottom">
          <div className="price">
            <span>{formatPrice(product.price)}</span>
            <small>وحدة نقدية</small>
          </div>

          <button
            className="quick-view-button"
            onClick={() => onOpen(product)}
            aria-label="عرض تفاصيل المنتج"
          >
            <ArrowLeft size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const stock = Math.max(0, Number(product.stock) || 0);
  const safeQuantity = Math.min(quantity, Math.max(stock, 1));

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        <div className="modal-art">
          <ProductArtwork product={product} large />
        </div>

        <div className="modal-details">
          <span className="eyebrow">قطعة صنعت بحب</span>

          <h2 id="modal-product-title">{product.name}</h2>

          <p className="modal-category">
            {product.category?.name || "منتجات يدوية"}
          </p>

          <div className="modal-price">
            {formatPrice(product.price)}
            <small>وحدة نقدية</small>
          </div>

          <p className="modal-description">
            {product.description ||
              "قطعة يدوية مميزة من أحد صناع المنتجات المستقلين."}
          </p>

          <div className="modal-stock">
            <span
              className={
                stock > 0 ? "available-dot" : "unavailable-dot"
              }
            />
            {stock > 0
              ? `متوفر في المخزون: ${stock} قطعة`
              : "غير متوفر حاليًا"}
          </div>

          <div className="quantity-row">
            <span>الكمية</span>

            <div className="quantity-control">
              <button
                onClick={() =>
                  setQuantity((value) => Math.max(1, value - 1))
                }
                disabled={safeQuantity <= 1}
                aria-label="تقليل الكمية"
              >
                <Minus size={15} />
              </button>

              <span>{safeQuantity}</span>

              <button
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(stock, value + 1)
                  )
                }
                disabled={stock === 0 || safeQuantity >= stock}
                aria-label="زيادة الكمية"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="modal-total">
            <span>الإجمالي</span>
            <strong>
              {formatPrice(Number(product.price) * safeQuantity)}
            </strong>
          </div>

          <button
            className="primary-button modal-action"
            disabled={stock === 0}
            onClick={() => {
              onAddToCart(product, safeQuantity);
              onClose();
            }}
          >
            <ShoppingBag size={18} />
            إضافة للسلة
          </button>

          <p className="modal-note">
            يمكنك مراجعة المنتجات والكميات المضافة إلى سلتك.
          </p>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
  try {
    const savedCart = localStorage.getItem("marketplace-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadData = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        apiGet("/products?per_page=100", signal),
        apiGet("/categories", signal),
      ]);

      const productList = Array.isArray(productsResult)
        ? productsResult
        : productsResult?.data || [];

      const categoryList = Array.isArray(categoriesResult)
        ? categoriesResult
        : categoriesResult?.data || [];

      setProducts(productList);
      setCategories(categoryList);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      setError(
        "لم نتمكن من الاتصال بالمتجر. تأكد أن Laravel يعمل وأن عنوان الـ API صحيح."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        loadData(controller.signal);
      }
    });

    return () => controller.abort();
  }, [loadData]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "marketplace-cart",
        JSON.stringify(cartItems)
      );
    } catch (storageError) {
      console.error("تعذر حفظ السلة:", storageError);
    }
  }, [cartItems]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    const term = search.trim().toLowerCase();

    if (term) {
      list = list.filter((product) =>
        [
          product.name,
          product.description,
          product.category?.name,
          product.seller?.name,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term)
          )
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter(
        (product) =>
          String(product.category?.id) ===
          String(selectedCategory)
      );
    }

    if (minPrice !== "" && Number.isFinite(Number(minPrice))) {
      list = list.filter(
        (product) => Number(product.price) >= Number(minPrice)
      );
    }

    if (maxPrice !== "" && Number.isFinite(Number(maxPrice))) {
      list = list.filter(
        (product) => Number(product.price) <= Number(maxPrice)
      );
    }

    if (sort === "price-low") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return list;
  }, [
    products,
    search,
    selectedCategory,
    minPrice,
    maxPrice,
    sort,
  ]);

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const addToCart = (product, quantity) => {
    const stock = Math.max(0, Number(product.stock) || 0);
    const requestedQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    if (stock === 0) {
      alert("المنتج غير متوفر في المخزون.");
      return;
    }

    setCartItems((current) => {
      const existingItem = current.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        const newQuantity = Math.min(
          Number(existingItem.quantity || 0) + requestedQuantity,
          stock
        );

        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                stock,
                price: Number(product.price) || 0,
                name: product.name,
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          quantity: Math.min(requestedQuantity, stock),
          stock,
        },
      ];
    });

    alert("تمت إضافة المنتج إلى السلة.");
  };

  const openCart = () => {
    if (cartItems.length === 0) {
      alert("سلتك فارغة حاليًا.");
      return;
    }

    const cartSummary = cartItems
      .map(
        (item) => `${item.name} — ${item.quantity} × ${formatPrice(item.price)}`
      )
      .join("\n");
    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    alert(`محتويات السلة:\n\n${cartSummary}\n\nالإجمالي: ${formatPrice(total)}`);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  const scrollToProducts = () => {
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth" });

    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell" dir="rtl">
      <div className="announcement-bar">
        <Sparkles size={14} />
        <span>
          كل قطعة لها حكاية — اكتشف إبداع الصناع المستقلين
        </span>
        <Sparkles size={14} />
      </div>

      <header className="site-header">
        <div className="header-inner">
          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen((value) => !value)
            }
            aria-label="فتح القائمة"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

          <a
            href="#home"
            className="brand"
            aria-label="Handmade Market الرئيسية"
          >
            <span className="brand-mark">
              <ShoppingBag size={23} strokeWidth={1.7} />
              <span className="brand-sparkle">✦</span>
            </span>

            <span className="brand-text">
              <strong>حِرفة</strong>
              <small>HANDMADE MARKET</small>
            </span>
          </a>

          <nav
            className={`main-nav ${
              mobileMenuOpen ? "nav-open" : ""
            }`}
          >
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
            >
              الرئيسية
            </a>
            <a
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
            >
              الأقسام
            </a>
            <a href="#products" onClick={scrollToProducts}>
              اكتشف المنتجات
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
            >
              عن المتجر
            </a>
          </nav>

          <div className="header-actions">
            <button
              className="header-icon-button"
              onClick={() => {
                setSearch("");
                scrollToProducts();
              }}
              aria-label="البحث عن المنتجات"
            >
              <Search size={20} />
            </button>

            <button
              className="header-icon-button favorite-header"
              onClick={() => {
                setSearch("");
                scrollToProducts();
              }}
              aria-label="المنتجات المفضلة"
            >
              <Heart size={20} />
              {favorites.length > 0 && (
                <span className="header-count">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              className="header-cart"
              onClick={openCart}
            >
              <ShoppingBag size={17} />
              <span>سلتي</span>
              {cartItems.length > 0 && (
                <span className="header-count">
                  {cartItems.reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0
                  )}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-decoration hero-decoration-one" />
          <div className="hero-decoration hero-decoration-two" />

          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="kicker-line" />
              <span>صُنع بشغف، اختير بعناية</span>
            </div>

            <h1>
              مش مجرد منتج،
              <br />
              <span>دي حكاية حِرفة.</span>
            </h1>

            <p>
              اكتشف قطعًا فريدة صنعتها أيادٍ مبدعة. تفاصيل صغيرة،
              وشغف كبير، وقطع تضيف روحًا خاصة لكل مكان.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={scrollToProducts}
              >
                اكتشف المجموعة
                <ArrowLeft size={18} />
              </button>

              <a href="#categories" className="text-link">
                تصفح الأقسام
                <ArrowLeft size={16} />
              </a>
            </div>

            <div className="hero-social-proof">
              <div className="avatar-stack">
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

          <div className="hero-visual">
            <div className="hero-art-card hero-art-back">
              <span>✦</span>
            </div>

            <div className="hero-art-card hero-art-front">
              <span className="hero-pot">🏺</span>
              <span className="hero-art-label">MADE BY HAND</span>
            </div>

            <div className="floating-note floating-note-top">
              <Sparkles size={16} />
              <span>تفاصيل فريدة</span>
            </div>

            <div className="floating-note floating-note-bottom">
              <Heart size={16} />
              <span>صنع بحب</span>
            </div>

            <span className="hero-star hero-star-one">✳</span>
            <span className="hero-star hero-star-two">✦</span>
          </div>

          <div className="hero-index">
            <span>01</span> / 04
          </div>
        </section>

        <section className="benefits-strip" id="about">
          <div className="benefit-item">
            <span className="benefit-icon">
              <Sparkles size={21} />
            </span>
            <div>
              <strong>قطع مميزة</strong>
              <small>اختيارات لها شخصية</small>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">
              <ShieldCheck size={21} />
            </span>
            <div>
              <strong>صناع مستقلون</strong>
              <small>ندعم المواهب المحلية</small>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">
              <Package size={21} />
            </span>
            <div>
              <strong>تفاصيل مدروسة</strong>
              <small>كل قطعة مختلفة</small>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">
              <Truck size={21} />
            </span>
            <div>
              <strong>تجربة سهلة</strong>
              <small>تصفح واكتشف منتجاتنا</small>
            </div>
          </div>
        </section>

        <section
          className="categories-section section-container"
          id="categories"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">تسوق حسب ذوقك</span>
              <h2>
                مساحة لكل <span>إبداع</span>
              </h2>
              <p>اختار القسم اللي يشبهك واكتشف تفاصيله.</p>
            </div>

            <button
              className="section-link"
              onClick={scrollToProducts}
            >
              كل المنتجات <ArrowLeft size={17} />
            </button>
          </div>

          {loading && categories.length === 0 ? (
            <div className="category-loading">
              جاري تحميل الأقسام...
            </div>
          ) : (
            <div className="category-grid">
              <button
                className={`category-card category-all ${
                  selectedCategory === "all"
                    ? "category-selected"
                    : ""
                }`}
                onClick={() => {
                  setSelectedCategory("all");
                  scrollToProducts();
                }}
              >
                <span className="category-art category-art-all">
                  ✦
                </span>

                <span className="category-card-text">
                  <strong>كل المنتجات</strong>
                  <small>اكتشف المجموعة كاملة</small>
                </span>

                <ArrowLeft
                  size={17}
                  className="category-arrow"
                />
              </button>

              {categories.map((category) => {
                const art = getArt(category);

                return (
                  <button
                    key={category.id}
                    className={`category-card ${
                      selectedCategory === String(category.id)
                        ? "category-selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(String(category.id));
                      scrollToProducts();
                    }}
                  >
                    <span
                      className={`category-art ${art.className}`}
                    >
                      {art.icon}
                    </span>

                    <span className="category-card-text">
                      <strong>{category.name}</strong>
                      <small>
                        {category.description ||
                          "اكتشف منتجات هذا القسم"}
                      </small>
                    </span>

                    <ArrowLeft
                      size={17}
                      className="category-arrow"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section
          className="products-section section-container"
          id="products"
        >
          <div className="section-heading products-heading">
            <div>
              <span className="eyebrow">اختياراتنا لك</span>
              <h2>
                اكتشف <span>المنتجات</span>
              </h2>
              <p>
                قطع فريدة من صناع عندهم شغف بالتفاصيل.
              </p>
            </div>

            <div className="results-count">
              <span>{filteredProducts.length}</span> منتج
            </div>
          </div>

          <div className="catalog-toolbar">
            <label className="search-field">
              <Search size={19} />

              <input
                type="search"
                placeholder="بتدور على إيه؟"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              )}
            </label>

            <div className="toolbar-filters">
              <label className="filter-select">
                <SlidersHorizontal size={17} />

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  aria-label="تصفية حسب القسم"
                >
                  <option value="all">كل الأقسام</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={String(category.id)}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-select">
                <ArrowUpDown size={17} />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                  aria-label="ترتيب المنتجات"
                >
                  <option value="newest">الأحدث أولًا</option>
                  <option value="price-low">
                    السعر: من الأقل للأعلى
                  </option>
                  <option value="price-high">
                    السعر: من الأعلى للأقل
                  </option>
                  <option value="name">الاسم</option>
                </select>
              </label>
            </div>
          </div>

          <div className="price-filter-row">
            <span>نطاق السعر:</span>

            <label>
              <span>من</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(event) =>
                  setMinPrice(event.target.value)
                }
              />
            </label>

            <label>
              <span>إلى</span>
              <input
                type="number"
                min="0"
                placeholder="∞"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(event.target.value)
                }
              />
            </label>

            <button
              className="reset-filters"
              onClick={resetFilters}
            >
              <RotateCcw size={14} />
              إعادة ضبط
            </button>
          </div>

          {error && (
            <div className="error-panel">
              <AlertCircle size={24} />

              <div>
                <strong>فيه مشكلة في الاتصال</strong>
                <p>{error}</p>
                <small className="api-address">
                  العنوان الحالي: {API_BASE}
                </small>
              </div>

              <button
                onClick={() => loadData()}
                className="retry-button"
              >
                <RefreshCw size={16} />
                إعادة المحاولة
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="skeleton-card" key={index}>
                  <div className="skeleton-image" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ))}
            </div>
          ) : !error && filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                <Search size={30} />
              </span>

              <h3>ملقيناش منتجات مطابقة</h3>              <p>جرّب كلمة بحث مختلفة أو غيّر الفلاتر.</p>

              <button
                className="primary-button"
                onClick={resetFilters}
              >
                عرض كل المنتجات
              </button>
            </div>
          ) : !error ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={setSelectedProduct}
                  favorites={favorites}
                  onFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section className="craft-banner section-container">
          <div className="craft-banner-symbol">✳</div>

          <div>
            <span className="eyebrow">
              وراء كل قطعة حكاية
            </span>
            <h2>الجمال في التفاصيل الصغيرة.</h2>
            <p>
              اكتشف منتجات اتعملت بشغف، واتصممت علشان تعيش معاك.
            </p>
          </div>

          <button
            className="banner-button"
            onClick={scrollToProducts}
          >
            اكتشف المنتجات <ArrowLeft size={17} />
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <a href="#home" className="brand footer-brand">
            <span className="brand-mark">
              <ShoppingBag size={23} strokeWidth={1.7} />
              <span className="brand-sparkle">✦</span>
            </span>

            <span className="brand-text">
              <strong>حِرفة</strong>
              <small>HANDMADE MARKET</small>
            </span>
          </a>

          <p>
            مكان يجمع الإبداع، الحِرفة، والقطع اللي ليها روح.
          </p>

          <button
            className="footer-top-link"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            للأعلى ↑
          </button>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} حِرفة — Handmade Market
          </span>
          <span>صُنع بحب لدعم الإبداع المستقل</span>
        </div>
      </footer>

      <ProductModal
        key={selectedProduct?.id ?? "no-product"}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}

export default App;
