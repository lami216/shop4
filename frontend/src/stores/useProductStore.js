import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";
import { translate } from "../lib/locale";

export const useProductStore = create((set, get) => ({
        products: [],
        selectedProduct: null,
        loading: false,
        productDetailsLoading: false,

        setProducts: (products) => {
                const currentSelected = get().selectedProduct;
                const nextSelected = currentSelected
                        ? products.find((product) => product._id === currentSelected._id) || currentSelected
                        : null;
                set({ products, selectedProduct: nextSelected });
        },
        setSelectedProduct: (product) => set({ selectedProduct: product }),
        clearSelectedProduct: () => set({ selectedProduct: null }),
        createProduct: async (productData) => {
                set({ loading: true });
                try {
                        const data = await apiClient.post(`/products`, productData);
                        set((prevState) => ({
                                products: [...prevState.products, data],
                                loading: false,
                        }));
                        toast.success(translate("common.messages.productCreated"));
                        return data;
                } catch (error) {
                        toast.error(error.response?.data?.message || translate("toast.createProductError"));
                        set({ loading: false });
                        throw error;
                }
        },
        updateProduct: async (productId, productData) => {
                set({ loading: true });
                try {
                        const data = await apiClient.put(`/products/${productId}`, productData);
                        set((prevState) => ({
                                products: prevState.products.map((product) =>
                                        product._id === productId ? data : product
                                ),
                                selectedProduct:
                                        prevState.selectedProduct?._id === productId
                                                ? data
                                                : prevState.selectedProduct,
                                loading: false,
                        }));
                        toast.success(translate("common.messages.productUpdated"));
                        return data;
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.updateProductError"));
                        throw error;
                }
        },
        fetchAllProducts: async () => {
                set({ loading: true });
                let hadError = false;
                let resolvedMessage = translate("toast.fetchProductsError");
                const data = await apiClient.get(`/products`, {
                        suppressError: true,
                        errorFallback: { products: [] },
                        onError: (error) => {
                                hadError = true;
                                resolvedMessage =
                                        error.response?.data?.message || translate("toast.fetchProductsError");
                                toast.error(resolvedMessage);
                        },
                });
                if (hadError) {
                        set({ error: resolvedMessage, loading: false });
                        return [];
                }
                get().setProducts(Array.isArray(data?.products) ? data.products : []);
                set({ loading: false, error: null });
                return data?.products ?? [];
        },
        fetchProductsByCategory: async (category) => {
                set({ loading: true });
                let hadError = false;
                let resolvedMessage = translate("toast.fetchProductsError");
                const data = await apiClient.get(`/products/category/${category}`, {
                        suppressError: true,
                        errorFallback: { products: [] },
                        onError: (error) => {
                                hadError = true;
                                resolvedMessage =
                                        error.response?.data?.message || translate("toast.fetchProductsError");
                                toast.error(resolvedMessage);
                        },
                });
                if (hadError) {
                        set({ error: resolvedMessage, loading: false });
                        return [];
                }
                get().setProducts(Array.isArray(data?.products) ? data.products : []);
                set({ loading: false, error: null });
                return data?.products ?? [];
        },
        fetchProductById: async (productId) => {
                const existingProduct = get().products.find((product) => product._id === productId);
                if (existingProduct) {
                        set({ selectedProduct: existingProduct });
                        return existingProduct;
                }

                set({ productDetailsLoading: true });

                try {
                        const data = await apiClient.get(`/products/${productId}`);
                        set((prevState) => {
                                const alreadyInList = prevState.products.some((product) => product._id === data._id);
                                return {
                                        products: alreadyInList
                                                ? prevState.products.map((product) =>
                                                          product._id === data._id ? data : product
                                                  )
                                                : [...prevState.products, data],
                                        selectedProduct: data,
                                        productDetailsLoading: false,
                                };
                        });
                        return data;
                } catch (error) {
                        set({ productDetailsLoading: false });
                        toast.error(error.response?.data?.message || translate("toast.loadProductError"));
                        throw error;
                }
        },
        deleteProduct: async (productId) => {
                set({ loading: true });
                try {
                        await apiClient.delete(`/products/${productId}`);
                        set((prevState) => ({
                                products: prevState.products.filter((product) => product._id !== productId),
                                selectedProduct:
                                        prevState.selectedProduct?._id === productId ? null : prevState.selectedProduct,
                                loading: false,
                        }));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.deleteProductError"));
                }
        },
        toggleFeaturedProduct: async (productId) => {
                set({ loading: true });
                try {
                        const data = await apiClient.patch(`/products/${productId}`);
                        set((prevState) => ({
                                products: prevState.products.map((product) =>
                                        product._id === productId ? { ...product, isFeatured: data.isFeatured } : product
                                ),
                                selectedProduct:
                                        prevState.selectedProduct?._id === productId
                                                ? { ...prevState.selectedProduct, isFeatured: data.isFeatured }
                                                : prevState.selectedProduct,
                                loading: false,
                        }));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.updateProductError"));
                }
        },
        fetchFeaturedProducts: async () => {
                set({ loading: true });
                let hadError = false;
                const fallbackMessage = translate("toast.fetchProductsError");
                const data = await apiClient.get(`/products/featured`, {
                        suppressError: true,
                        errorFallback: [],
                        onError: (error) => {
                                hadError = true;
                                console.error("Failed to fetch featured products", error);
                                toast.error(error.response?.data?.message || fallbackMessage);
                        },
                });
                if (hadError) {
                        set({ error: fallbackMessage, loading: false });
                        return [];
                }
                const featuredProducts = Array.isArray(data) ? data : [];
                get().setProducts(featuredProducts);
                set({ loading: false, error: null });
                return featuredProducts;
        },
}));
