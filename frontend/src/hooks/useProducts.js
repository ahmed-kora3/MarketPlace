import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../services/apiClient";

export function useProducts() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [requestState, setRequestState] = useState({ loading: true, error: "" });
  const [loadTrigger, setLoadTrigger] = useState(0);
  const requestIdRef = useRef(0);

  const reload = useCallback(() => {
    requestIdRef.current += 1;
    setRequestState({ loading: true, error: "" });
    setLoadTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const requestId = requestIdRef.current;
    let active = true;

    Promise.all([
      apiClient.get("/products?per_page=100", { signal }),
      apiClient.get("/categories", { signal }),
    ])
      .then(([productsResult, categoriesResult]) => {
        if (!active || signal.aborted || requestId !== requestIdRef.current) return;

        const productList = Array.isArray(productsResult)
          ? productsResult
          : productsResult?.data ?? [];

        const categoryList = Array.isArray(categoriesResult)
          ? categoriesResult
          : categoriesResult?.data ?? [];

        setProducts(productList);
        setCategories(categoryList);
        setRequestState({ loading: false, error: "" });
      })
      .catch((err) => {
        if (
          !active ||
          signal.aborted ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        controller.abort();
        setRequestState({
          loading: false,
          error:
            (err instanceof Error && err.message) ||
            "لم نتمكن من الاتصال بالمتجر. تأكد أن الخادم يعمل.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadTrigger]);

  return {
    products,
    categories,
    loading: requestState.loading,
    error: requestState.error,
    reload,
  };
}
