
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  Trash2,
  ArrowRight,
  CheckCircle2,
  TriangleAlert,
  Info,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const CART_KEY = "marketplace-cart";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const categoryArt = {
  jewelry: { icon: "💍", className: "art-jewelry" },
  pottery: { icon: "🏺", className: "art-pottery" },
  paintings: { icon: "🎨", className: "art-paintings" },
  textiles: { icon: "🧶", className: "art-textiles" },
  woodwork: { icon: "🪵", className: "art-woodwork" },
};

const defaultArt = {
  icon: "✨",
  className: "art-default",
};

async function apiGet(path, signal) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  let result;
  try {
    result = await response.json();
  } catch {
    if (response.ok) {
      throw new ApiError("استجابة غير صالحة من واجهة المتجر.", response.status);
    }
    result = {};
  }

  if (!response.ok) {
    throw new ApiError(
      result.message || `Request failed (${response.status})`,
      response.status
    );
  }

  if (result.status === "Error") {
    throw new ApiError(
      result.message || "حدث خطأ أثناء تحميل البيانات.",
      response.status
    );
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

function readSavedCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      const price = Number(item?.price);
      const quantity = Math.floor(Number(item?.quantity));
      const stock = Math.max(0, Number(item?.stock) || 0);

      if (
        item === null ||
        typeof item !== "object" ||
        item.id === undefined ||
        typeof item.name !== "string" ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isFinite(quantity) ||
        quantity < 1
      ) {
        return [];
      }

      return [{
        ...item,
        price,
        quantity: stock > 0 ? Math.min(quantity, stock) : quantity,
        stock,
      }];
    });
  } catch {
    return [];
  }
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
  const stock = Math.max(0, Number(product.stock) || 0);

  return (
    <article className="product-card">
      <button
        type="button"
        className={`favorite-button ${
          isFavorite ? "is-favorite" : ""
        }`}
        onClick={() => onFavorite(product.id)}
        aria-label={
          isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"
        }
        aria-pressed={isFavorite}
      >
        <Heart
          size={18}
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>

      <button
        type="button"
        className="product-image-button"
        onClick={() => onOpen(product)}
        aria-label={`عرض تفاصيل ${product.name}`}
      >
        <ProductArtwork product={product} />

        {stock > 0 && stock <= 5 && (
          <span className="stock-badge">كمية محدودة</span>
        )}

        {stock <= 0 && (
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
          type="button"
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
            type="button"
            className="quick-view-button"
            onClick={() => onOpen(product)}
            aria-label={`عرض تفاصيل ${product.name}`}
          >
            <ArrowLeft size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function QuantityControl({
  quantity,
  stock,
  onChange,
}) {
  return (
    <div className="quantity-control">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        aria-label="تقليل الكمية"
      >
        <Minus size={15} />
      </button>

      <span>{quantity}</span>

      <button
        type="button"
        onClick={() =>
          onChange(Math.min(stock, quantity + 1))
        }
        disabled={quantity >= stock}
        aria-label="زيادة الكمية"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function ProductDetailsPage({
  productId,
  favorites,
  onFavorite,
  onAddToCart,
  onBack,
}) {
  const [quantity, setQuantity] = useState(1);
  const [request, setRequest] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        const product = await apiGet(
          `/products/${encodeURIComponent(productId)}`,
          controller.signal
        );

        if (controller.signal.aborted) return;

        if (
          !product ||
          typeof product !== "object" ||
          product.is_archived
        ) {
          setRequest({ status: "not-found" });
          return;
        }

        if (product.id === undefined) {
          throw new ApiError("استجابة غير صالحة من واجهة المتجر.", 200);
        }

        setRequest({ status: "ready", product });
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error instanceof ApiError && error.status === 404) {
          setRequest({ status: "not-found" });
        } else if (error instanceof ApiError) {
          setRequest({ status: "api-error", message: error.message });
        } else {
          setRequest({ status: "network-error" });
        }
      }
    }

    void loadProduct();

    return () => controller.abort();
  }, [productId, attempt]);

  if (request.status === "loading") {
    return (
      <main className="detail-page section-container" aria-live="polite">
        <div className="detail-loading">
          <div className="detail-loading-art" />
          <div className="detail-loading-copy">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>جاري تحميل تفاصيل المنتج...</p>
        </div>
      </main>
    );
  }

  if (request.status === "not-found") {
    return (
      <main className="detail-page section-container">
        <div className="empty-state">
          <Package size={36} />
          <h2>المنتج غير موجود</h2>
          <p>قد يكون المنتج غير متاح أو تم حذفه.</p>
          <button type="button" className="primary-button" onClick={onBack}>
            العودة للمتجر
          </button>
        </div>
      </main>
    );
  }

  if (
    request.status === "api-error" ||
    request.status === "network-error"
  ) {
    const isNetworkError = request.status === "network-error";

    return (
      <main className="detail-page section-container">
        <div className="error-panel detail-error" role="alert">
          <AlertCircle size={24} />
          <div>
            <strong>
              {isNetworkError
                ? "تعذر الاتصال بالمتجر"
                : "حدث خطأ أثناء تحميل المنتج"}
            </strong>
            <p>
              {isNetworkError
                ? "تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى."
                : request.message}
            </p>
          </div>
          <button
            type="button"
            className="retry-button"
            onClick={() => {
              setRequest({ status: "loading" });
              setAttempt((current) => current + 1);
            }}
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        </div>
        <button type="button" className="back-link" onClick={onBack}>
          <ArrowRight size={18} />
          العودة للمنتجات
        </button>
      </main>
    );
  }

  const { product } = request;
  const stock = Math.max(0, Number(product.stock) || 0);
  const safeQuantity = Math.min(
    Math.max(1, quantity),
    Math.max(1, stock)
  );

  return (
    <main className="detail-page section-container">
      <button className="back-link" onClick={onBack}>
        <ArrowRight size={18} />
        العودة للمنتجات
      </button>

      <div className="detail-layout">
        <div className="detail-art">
          <ProductArtwork product={product} large />
          <button
            type="button"
            className={`detail-favorite-button ${
              favorites.includes(product.id) ? "is-favorite" : ""
            }`}
            onClick={() => onFavorite(product.id)}
            aria-label={
              favorites.includes(product.id)
                ? "إزالة من المفضلة"
                : "إضافة للمفضلة"
            }
            aria-pressed={favorites.includes(product.id)}
          >
            <Heart
              size={19}
              fill={favorites.includes(product.id) ? "currentColor" : "none"}
            />
          </button>
        </div>

        <section className="detail-info">
          <span className="eyebrow">قطعة صنعت بحب</span>

          <h1>{product.name}</h1>

          <p className="modal-category">
            {product.category?.name || "منتجات يدوية"}
          </p>

          <div className="detail-price">
            {formatPrice(product.price)}
            <small>وحدة نقدية</small>
          </div>

          <p className="detail-description">
            {product.description ||
              "قطعة يدوية مميزة من أحد صناع المنتجات المستقلين."}
          </p>

          <p className="product-seller">
            <span className="seller-dot" />
            {product.seller?.name || "صانع مستقل"}
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

          {stock > 0 && (
            <div className="quantity-row">
              <span>الكمية</span>
              <QuantityControl
                quantity={safeQuantity}
                stock={stock}
                onChange={setQuantity}
              />
            </div>
          )}

          <div className="modal-total">
            <span>الإجمالي</span>
            <strong>
              {formatPrice(
                Number(product.price) * safeQuantity
              )}
            </strong>
          </div>

          <button
            type="button"
            className="primary-button modal-action"
            disabled={stock <= 0}
            onClick={() => onAddToCart(product, safeQuantity)}
          >
            <ShoppingBag size={18} />
            إضافة للسلة
          </button>
        </section>
      </div>
    </main>
  );
}

function CartPage({
  cartItems,
  onChangeQuantity,
  onRemove,
  onClearCart,
  onContinueShopping,
}) {
  const [checkoutNoticeOpen, setCheckoutNoticeOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const checkoutDialogRef = useRef(null);
  const confirmDialogRef = useRef(null);
  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  useEffect(() => {
    const dialog = checkoutDialogRef.current;
    if (!dialog) return;

    if (checkoutNoticeOpen && !dialog.open) {
      dialog.showModal();
    } else if (!checkoutNoticeOpen && dialog.open) {
      dialog.close();
    }
  }, [checkoutNoticeOpen]);

  useEffect(() => {
    const dialog = confirmDialogRef.current;
    if (!dialog) return;

    if (confirmOpen && !dialog.open) {
      dialog.showModal();
    } else if (!confirmOpen && dialog.open) {
      dialog.close();
    }
  }, [confirmOpen]);

  const confirmClearCart = () => {
    setConfirmOpen(true);
  };

  const handleConfirmClearCart = () => {
    onClearCart();
    setConfirmOpen(false);
  };

  return (
    <main className="cart-page section-container">
      <button className="back-link" onClick={onContinueShopping}>
        <ArrowRight size={18} />
        متابعة التسوق
      </button>

      <div className="section-heading">
        <div>
          <span className="eyebrow">اختياراتك المميزة</span>
          <h1>سلة المشتريات</h1>
          <p>راجع المنتجات والكميات قبل إتمام الشراء.</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <ShoppingBag size={30} />
          </span>
          <h2>سلتك فارغة حاليًا</h2>
          <p>اكتشف المنتجات وأضف القطع التي أعجبتك.</p>
          <button
            className="primary-button"
            onClick={onContinueShopping}
          >
            اكتشف المنتجات
            <ArrowLeft size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => {
              const stock = Math.max(
                0,
                Number(item.stock) || 0
              );

              return (
                <article
                  className="cart-item"
                  key={item.id}
                >
                  <div className="cart-item-art">
                    <ProductArtwork
                      product={{
                        category: item.category,
                        name: item.name,
                      }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>{formatPrice(item.price)} وحدة نقدية</p>

                    <div className="cart-item-controls">
                      <QuantityControl
                        quantity={Number(item.quantity)}
                        stock={stock}
                        onChange={(quantity) =>
                          onChangeQuantity(item.id, quantity)
                        }
                      />

                      <button
                        type="button"
                        className="remove-cart-item"
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  </div>

                  <strong className="cart-item-total">
                    {formatPrice(
                      Number(item.price) *
                        Number(item.quantity)
                    )}
                  </strong>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>ملخص الطلب</h2>

            <div className="cart-summary-row">
              <span>عدد القطع</span>
              <strong>
                {cartItems.reduce(
                  (sum, item) =>
                    sum + Number(item.quantity || 0),
                  0
                )}
              </strong>
            </div>

            <div className="cart-summary-row">
              <span>المجموع الفرعي</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <div className="cart-summary-row cart-total-row">
              <span>الإجمالي</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <p>
              لا تشمل هذه الصفحة الشحن أو الدفع الإلكتروني حتى يتم
              ربط نظام إتمام الطلب.
            </p>

            <div className="cart-summary-actions">
              <button
                type="button"
                className="primary-button checkout-button"
                onClick={() => setCheckoutNoticeOpen(true)}
              >
                إكمال الطلب
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                className="clear-cart-button"
                onClick={confirmClearCart}
              >
                <Trash2 size={16} />
                إزالة جميع المنتجات من السلة
              </button>

              <button
                type="button"
                className="cart-continue-button"
                onClick={onContinueShopping}
              >
                متابعة التسوق
              </button>
            </div>
          </aside>
        </>
      )}

      <dialog
        ref={checkoutDialogRef}
        className="checkout-dialog"
        aria-labelledby="checkout-dialog-title"
        onClose={() => setCheckoutNoticeOpen(false)}
      >
        <div className="checkout-dialog-content">
          <button
            type="button"
            className="checkout-dialog-close"
            onClick={() => setCheckoutNoticeOpen(false)}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
          <span className="checkout-dialog-icon">
            <ShoppingBag size={24} />
          </span>
          <h2 id="checkout-dialog-title">إكمال الطلب غير متاح حاليًا</h2>
          <p>
            لم يتم ربط تسجيل الدخول وسلة المتجر المحلية بخدمة إتمام الطلب
            بعد. لم يتم إنشاء طلب، وستبقى منتجاتك في السلة.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => setCheckoutNoticeOpen(false)}
          >
            حسنًا
          </button>
        </div>
      </dialog>

      <dialog
        ref={confirmDialogRef}
        className="confirm-dialog"
        aria-labelledby="confirm-dialog-title"
        onClose={() => setConfirmOpen(false)}
      >
        <div className="confirm-dialog-content">
          <button
            type="button"
            className="checkout-dialog-close"
            onClick={() => setConfirmOpen(false)}
            aria-label="إغلاق التأكيد"
          >
            <X size={18} />
          </button>
          <span className="confirm-dialog-icon">
            <Trash2 size={22} />
          </span>
          <h2 id="confirm-dialog-title">تأكيد إزالة السلة</h2>
          <p>هل أنت متأكد من إزالة جميع المنتجات من السلة؟</p>
          <div className="confirm-dialog-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setConfirmOpen(false)}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={handleConfirmClearCart}
            >
              تأكيد الإزالة
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeProductId } = useParams();

  const [toasts, setToasts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogError, setCatalogError] = useState("");
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState(readSavedCart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const currentPath = location.pathname;
  const isCartPage = currentPath === "/cart";
  const isProductPage = currentPath.startsWith("/products/");
  const isHomePage = currentPath === "/";
  const loading = catalogStatus === "loading";
  const error = catalogStatus === "error";

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
      const [productsResult, categoriesResult] = await Promise.all([
        apiGet("/products?per_page=100", controller.signal),
        apiGet("/categories", controller.signal),
      ]);

      if (controller.signal.aborted) return;

      const productList = Array.isArray(productsResult)
        ? productsResult
        : productsResult?.data;
      const categoryList = Array.isArray(categoriesResult)
        ? categoriesResult
        : categoriesResult?.data;

      if (!Array.isArray(productList) || !Array.isArray(categoryList)) {
        throw new Error("استجابة غير صالحة من واجهة المتجر.");
      }

      setProducts(productList);
      setCategories(categoryList);
      setCatalogError("");
      setCatalogStatus("ready");
      } catch (loadError) {
      if (controller.signal.aborted) return;

      console.error("تعذر تحميل بيانات المتجر:", loadError);
      setCatalogError(
        loadError instanceof ApiError
          ? loadError.message
          : "لم نتمكن من الاتصال بالمتجر. تأكد أن Laravel يعمل وأن عنوان الـ API صحيح."
      );
      setCatalogStatus("error");
      }
    }

    void loadCatalog();

    return () => controller.abort();
  }, [catalogAttempt]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch (storageError) {
      console.error("تعذر حفظ السلة:", storageError);
    }
  }, [cartItems]);

  const showToast = (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((current) => [...current, { id, type, message }]);
  };

  useEffect(() => {
    if (toasts.length === 0) return undefined;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((item) => item.id !== toast.id)
        );
      }, 4000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

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

    if (showFavorites) {
      list = list.filter((product) => favorites.includes(product.id));
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
      list.sort((a, b) =>
        String(a.name).localeCompare(String(b.name), "ar")
      );
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
    showFavorites,
    favorites,
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

  const addToCart = (product, quantity = 1) => {
    const stock = Math.max(0, Number(product.stock) || 0);
    const requestedQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    if (stock <= 0) {
      showToast("error", "المنتج غير متوفر في المخزون.");
      return;
    }

    const existingItem = cartItems.find(
      (item) => String(item.id) === String(product.id)
    );

    const currentQuantity = Number(
      existingItem?.quantity || 0
    );

    if (currentQuantity + requestedQuantity > stock) {
      showToast("warning", "الكمية المطلوبة أكبر من المخزون المتاح.");
      return;
    }

    setCartItems((current) => {
      const existing = current.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existing) {
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity:
                  Number(item.quantity) + requestedQuantity,
                stock,
                price: Number(product.price) || 0,
                name: product.name,
                category: product.category,
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
          category: product.category,
        },
      ];
    });

    showToast("success", "تمت إضافة المنتج إلى السلة بنجاح.");
  };

  const changeCartQuantity = (id, quantity) => {
    setCartItems((current) =>
      current.map((item) => {
        if (String(item.id) !== String(id)) return item;

        const stock = Math.max(0, Number(item.stock) || 0);
        const maximum = stock > 0 ? stock : Number(item.quantity);

        return {
          ...item,
          quantity: Math.min(
            maximum,
            Math.max(1, Math.floor(Number(quantity) || 1))
          ),
        };
      })
    );
  };

  const removeCartItem = (id) => {
    setCartItems((current) =>
      current.filter((item) => String(item.id) !== String(id))
    );
    showToast("success", "تم حذف المنتج من السلة.");
  };

  const clearCart = () => {
    setCartItems([]);
    showToast("info", "تمت إزالة جميع المنتجات من السلة.");
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setShowFavorites(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  const goHome = () => {
    navigate("/");
    setMobileMenuOpen(false);
  };

  const scrollToProducts = () => {
    if (currentPath !== "/") {
      navigate("/");
      window.setTimeout(() => {
        document
          .getElementById("products")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth" });
    }

    setMobileMenuOpen(false);
  };

  const openProduct = (product) => {
    navigate(`/products/${product.id}`);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCart = () => {
    navigate("/cart");
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const header = (
    <>
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
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen((value) => !value)
            }
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-navigation"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

          <button
            type="button"
            className="brand brand-button"
            onClick={goHome}
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
          </button>

          <nav
            id="primary-navigation"
            className={`main-nav ${
              mobileMenuOpen ? "nav-open" : ""
            }`}
          >
            <button type="button" onClick={goHome}>
              الرئيسية
            </button>
            <button
              type="button"
              onClick={() => {
                goHome();
                window.setTimeout(() => {
                  document
                    .getElementById("categories")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              الأقسام
            </button>
            <button type="button" onClick={scrollToProducts}>
              اكتشف المنتجات
            </button>
            <button
              type="button"
              onClick={() => {
                goHome();
                window.setTimeout(() => {
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              عن المتجر
            </button>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon-button"
              onClick={scrollToProducts}
              aria-label="البحث عن المنتجات"
            >
              <Search size={20} />
            </button>

            <button
              type="button"
              className="header-icon-button favorite-header"
              onClick={() => {
                setShowFavorites(true);
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
              type="button"
              className="header-cart"
              onClick={openCart}
            >
              <span className="cart-icon-wrapper">
                <ShoppingBag size={17} />
                {cartItems.length > 0 && (
                  <span className="header-count">
                    {cartItems.reduce(
                      (sum, item) =>
                        sum + Number(item.quantity || 0),
                      0
                    )}
                  </span>
                )}
              </span>
              <span>سلتي</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );

  const footer = (
    <footer className="site-footer">
      <div className="footer-main">
        <button
          type="button"
          className="brand footer-brand brand-button"
          onClick={goHome}
        >
          <span className="brand-mark">
            <ShoppingBag size={23} strokeWidth={1.7} />
            <span className="brand-sparkle">✦</span>
          </span>
          <span className="brand-text">
            <strong>حِرفة</strong>
            <small>HANDMADE MARKET</small>
          </span>
        </button>

        <p>
          مكان يجمع الإبداع، الحِرفة، والقطع اللي ليها روح.
        </p>

        <button
          type="button"
          className="footer-top-link"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
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
  );

  return (
    <div className="app-shell" dir="rtl">
      {header}

      {isCartPage ? (
        <CartPage
          cartItems={cartItems}
          onChangeQuantity={changeCartQuantity}
          onRemove={removeCartItem}
          onClearCart={clearCart}
          onContinueShopping={goHome}
        />
      ) : isProductPage ? (
        <ProductDetailsPage
          key={routeProductId}
          productId={routeProductId}
          favorites={favorites}
          onFavorite={toggleFavorite}
          onAddToCart={addToCart}
          onBack={goHome}
        />
      ) : isHomePage ? (
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
                  type="button"
                  className="primary-button"
                  onClick={scrollToProducts}
                >
                  اكتشف المجموعة
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() =>
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  تصفح الأقسام
                  <ArrowLeft size={16} />
                </button>
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
                type="button"
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
            ) : !error && categories.length === 0 ? (
              <div className="category-empty-state">
                لا توجد أقسام متاحة حاليًا.
              </div>
            ) : (
              <div className="category-grid">
                <button
                  type="button"
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
                      type="button"
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
                  {showFavorites ? (
                    <>منتجاتك <span>المفضلة</span></>
                  ) : (
                    <>اكتشف <span>المنتجات</span></>
                  )}
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
                    type="button"
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
                type="button"
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
                  <p>{catalogError}</p>
                  <small className="api-address">
                    العنوان الحالي: {API_BASE}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogError("");
                    setCatalogStatus("loading");
                    setCatalogAttempt((current) => current + 1);
                  }}
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
                <h3>ملقيناش منتجات مطابقة</h3>
                <p>جرّب كلمة بحث مختلفة أو غيّر الفلاتر.</p>
                <button
                  type="button"
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
                    onOpen={openProduct}
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
              type="button"
              className="banner-button"
              onClick={scrollToProducts}
            >
              اكتشف المنتجات <ArrowLeft size={17} />
            </button>
          </section>
        </main>
      ) : (
        <main className="detail-page section-container">
          <div className="empty-state">
            <Package size={36} />
            <h2>الصفحة غير موجودة</h2>
            <p>الرابط الذي فتحته غير متاح.</p>
            <button type="button" className="primary-button" onClick={goHome}>
              العودة للمتجر
            </button>
          </div>
        </main>
      )}

      {footer}

      {toasts.length > 0 && (
        <div className="toast-stack" aria-live="polite" aria-atomic="false">
          {toasts.map((toast) => {
            const Icon =
              toast.type === "success"
                ? CheckCircle2
                : toast.type === "error"
                  ? AlertCircle
                  : toast.type === "warning"
                    ? TriangleAlert
                    : Info;

            return (
              <div
                key={toast.id}
                className={`toast toast-${toast.type}`}
                role="status"
              >
                <span className="toast-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>

                <div className="toast-content">
                  <strong>
                    {toast.type === "success"
                      ? "نجاح"
                      : toast.type === "error"
                        ? "خطأ"
                        : toast.type === "warning"
                          ? "تحذير"
                          : "معلومة"}
                  </strong>
                  <span>{toast.message}</span>
                </div>

                <button
                  type="button"
                  className="toast-close"
                  onClick={() =>
                    setToasts((current) =>
                      current.filter((item) => item.id !== toast.id)
                    )
                  }
                  aria-label="إغلاق الرسالة"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
