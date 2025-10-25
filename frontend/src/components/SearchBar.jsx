import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Grid3x3, Loader2, Search as SearchIcon, X } from "lucide-react";

import useTranslation from "../hooks/useTranslation";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";
import { useCategoryStore } from "../stores/useCategoryStore";
import { useSearchStore } from "../stores/useSearchStore";

const SearchBar = ({ variant = "global", categorySlug = null }) => {
        const [showResults, setShowResults] = useState(false);
        const [showCategories, setShowCategories] = useState(false);

        const {
                query,
                setQuery,
                results,
                loading: searching,
                error,
                searchProducts,
                clearResults,
                category: selectedCategory,
                setCategory,
                cancelOngoing,
        } = useSearchStore((state) => ({
                query: state.query,
                setQuery: state.setQuery,
                results: state.results,
                loading: state.loading,
                error: state.error,
                searchProducts: state.searchProducts,
                clearResults: state.clearResults,
                category: state.category,
                setCategory: state.setCategory,
                cancelOngoing: state.cancelOngoing,
        }));

        const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
        const { t } = useTranslation();
        const navigate = useNavigate();
        const location = useLocation();
        const [, setSearchParams] = useSearchParams();
        const wrapperRef = useRef(null);
        const inputRef = useRef(null);
        const debounceTimeoutRef = useRef(null);
        const fetchedCategoriesRef = useRef(false);

        const supportsOverlay = variant === "global";
        const isSearchRoute = useMemo(() => location.pathname.startsWith("/search"), [location.pathname]);

        const buildQueryString = useCallback((term, categoryValue) => {
                const entries = [];
                if (term) {
                        entries.push(`q=${encodeURIComponent(term)}`);
                }
                if (categoryValue) {
                        entries.push(`category=${encodeURIComponent(categoryValue)}`);
                }
                return entries.join("&");
        }, []);

        const applySearchParams = useCallback(
                (queryString, { replace = true } = {}) => {
                        if (variant === "search" || variant === "category" || isSearchRoute) {
                                setSearchParams(queryString || "", { replace });
                        }
                },
                [isSearchRoute, setSearchParams, variant]
        );

        useEffect(() => {
                if (variant === "category") {
                        setCategory(categorySlug || null);
                        return;
                }

                if (variant === "global") {
                        setCategory(null);
                }
        }, [variant, categorySlug, setCategory]);

        useEffect(() => {
                const handleOutsideClick = (event) => {
                        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                                setShowResults(false);
                                setShowCategories(false);
                        }
                };

                document.addEventListener("mousedown", handleOutsideClick);

                return () => {
                        document.removeEventListener("mousedown", handleOutsideClick);
                };
        }, []);

        useEffect(() => {
                const handleKeyDown = (event) => {
                        if (event.key === "Escape") {
                                setShowResults(false);
                                setShowCategories(false);
                        }
                };

                document.addEventListener("keydown", handleKeyDown);

                return () => {
                        document.removeEventListener("keydown", handleKeyDown);
                };
        }, []);

        useEffect(() => {
                return () => {
                        cancelOngoing();
                        if (debounceTimeoutRef.current) {
                                clearTimeout(debounceTimeoutRef.current);
                                debounceTimeoutRef.current = null;
                        }
                };
        }, [cancelOngoing]);

        const handleSearch = useCallback(
                async ({
                        searchValue,
                        shouldNavigate = variant !== "category",
                        replace = variant !== "global",
                } = {}) => {
                        const valueFromField = searchValue ?? inputRef.current?.value ?? "";
                        const trimmedValue = valueFromField.trim();
                        const hasCategory = Boolean(selectedCategory);

                        if (!trimmedValue && !hasCategory) {
                                clearResults();
                                setShowResults(false);
                                applySearchParams("", { replace });
                                if (shouldNavigate) {
                                        navigate(
                                                { pathname: "/search", search: "" },
                                                { replace: true }
                                        );
                                }
                                return;
                        }

                        const queryString = buildQueryString(trimmedValue, hasCategory ? selectedCategory : null);

                        applySearchParams(queryString, { replace });

                        if (shouldNavigate) {
                                navigate(
                                        {
                                                pathname: "/search",
                                                search: queryString ? `?${queryString}` : "",
                                        },
                                        { replace }
                                );
                        }

                        await searchProducts({ query: trimmedValue, category: selectedCategory });

                        if (supportsOverlay) {
                                setShowResults(true);
                        }
                },
                [
                        applySearchParams,
                        buildQueryString,
                        clearResults,
                        navigate,
                        searchProducts,
                        selectedCategory,
                        supportsOverlay,
                        variant,
                ]
        );

        useEffect(() => {
                const trimmed = query.trim();
                const shouldSearch = Boolean(trimmed) || (selectedCategory && variant === "search");

                if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                        debounceTimeoutRef.current = null;
                }

                if (!shouldSearch) {
                        clearResults();
                        setShowResults(false);
                        return;
                }

                if (supportsOverlay) {
                        setShowResults(true);
                }

                debounceTimeoutRef.current = setTimeout(() => {
                        handleSearch({
                                searchValue: trimmed,
                                shouldNavigate: variant !== "category",
                                replace: true,
                        });
                }, 300);

                return () => {
                        if (debounceTimeoutRef.current) {
                                clearTimeout(debounceTimeoutRef.current);
                                debounceTimeoutRef.current = null;
                        }
                };
        }, [
                query,
                selectedCategory,
                variant,
                supportsOverlay,
                handleSearch,
                clearResults,
        ]);

        const handleSubmit = (event) => {
                event.preventDefault();

                if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                        debounceTimeoutRef.current = null;
                }

                handleSearch({
                        searchValue: inputRef.current?.value ?? query,
                        shouldNavigate: variant !== "category",
                        replace: variant !== "global",
                });
        };

        const handleSelectProduct = (product) => {
                navigate(`/products/${product._id}`);
                setQuery("");
                clearResults();
                setShowResults(false);
        };

        const handleClearCategorySelection = useCallback(() => {
                setCategory(null);
                setShowCategories(false);

                const trimmed = (inputRef.current?.value ?? query).trim();

                if (trimmed) {
                        handleSearch({
                                searchValue: trimmed,
                                shouldNavigate: variant !== "category",
                                replace: true,
                        });
                        return;
                }

                clearResults();
                if (supportsOverlay) {
                        setShowResults(false);
                }

                applySearchParams("", { replace: true });

                if (variant === "search") {
                        navigate(
                                { pathname: "/search", search: "" },
                                { replace: true }
                        );
                } else if (variant === "category") {
                        navigate("/search");
                }
        }, [
                applySearchParams,
                clearResults,
                handleSearch,
                navigate,
                query,
                setCategory,
                supportsOverlay,
                variant,
        ]);

        const handleSelectCategory = useCallback(
                (category) => {
                        const slug = category?.slug;

                        if (!slug) {
                                handleClearCategorySelection();
                                return;
                        }

                        setCategory(slug);
                        setShowCategories(false);

                        const trimmed = (inputRef.current?.value ?? query).trim();

                        if (trimmed) {
                                handleSearch({
                                        searchValue: trimmed,
                                        shouldNavigate: variant !== "category",
                                        replace: true,
                                });
                                return;
                        }

                        if (variant === "search") {
                                handleSearch({
                                        searchValue: "",
                                        shouldNavigate: true,
                                        replace: true,
                                });
                                return;
                        }

                        navigate(`/category/${slug}`);
                },
                [handleClearCategorySelection, handleSearch, navigate, query, setCategory, variant]
        );

        const handleToggleCategories = () => {
                setShowCategories((previous) => {
                        const next = !previous;
                        if (next && !fetchedCategoriesRef.current) {
                                if (!categories.length && !categoriesLoading) {
                                        fetchCategories();
                                }
                                fetchedCategoriesRef.current = true;
                        }
                        return next;
                });
                if (supportsOverlay) {
                        setShowResults(false);
                }
        };

        const handleChange = (event) => {
                setQuery(event.target.value);
                setShowCategories(false);
        };

        const handleClear = () => {
                setQuery("");
                clearResults();
                setShowResults(false);
                applySearchParams("", { replace: true });
                if (variant === "search") {
                        navigate(
                                { pathname: "/search", search: "" },
                                { replace: true }
                        );
                }
        };

        const activeCategoryName = useMemo(() => {
                if (!selectedCategory) {
                        return "";
                }
                const match = categories.find((item) => item.slug === selectedCategory);
                return match?.name ?? "";
        }, [categories, selectedCategory]);

        return (
                <div ref={wrapperRef} className='mx-auto flex w-full max-w-4xl flex-col gap-3'>
                        <form
                                onSubmit={handleSubmit}
                                className='flex flex-col gap-3 rounded-[18px] border border-athath-gold/25 bg-white/90 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur'
                        >
                                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                        <div className='relative flex-1'>
                                                <SearchIcon className='pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-athath-gold/80' />
                                                <input
                                                        type='search'
                                                        name='searchInput'
                                                        value={query}
                                                        onChange={handleChange}
                                                        ref={inputRef}
                                                        placeholder={t("search.placeholder")}
                                                        className='w-full rounded-[18px] border border-athath-charcoal/10 bg-white/80 py-3 pr-12 pl-4 text-base text-athath-ink placeholder:text-athath-placeholder transition focus:border-athath-gold focus:outline-none focus:ring-2 focus:ring-athath-gold/40'
                                                />
                                                {query && (
                                                        <button
                                                                type='button'
                                                                onClick={handleClear}
                                                                className='absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-athath-cream/70 text-athath-ink/70 transition hover:bg-white'
                                                                aria-label={t("search.clear")}
                                                        >
                                                                <X className='h-4 w-4' />
                                                        </button>
                                                )}
                                        </div>

                                        <div className='flex flex-row items-center gap-2 self-end sm:self-auto'>
                                                <button
                                                        type='submit'
                                                        className='flex items-center gap-2 rounded-[18px] bg-athath-gold px-5 py-3 text-sm font-semibold text-athath-ink shadow-[0_12px_24px_rgba(201,162,39,0.35)] transition hover:bg-[#b89322] hover:shadow-[0_16px_30px_rgba(139,94,60,0.25)] disabled:cursor-not-allowed disabled:opacity-70'
                                                        disabled={searching}
                                                >
                                                        {searching ? (
                                                                <Loader2 className='h-5 w-5 animate-spin' />
                                                        ) : (
                                                                <SearchIcon className='h-5 w-5' />
                                                        )}
                                                        <span>{t("search.action")}</span>
                                                </button>
                                                <button
                                                        type='button'
                                                        onClick={handleToggleCategories}
                                                        className='flex items-center gap-2 rounded-[18px] border border-athath-charcoal/10 bg-white/70 px-5 py-3 text-sm font-semibold text-athath-wood transition hover:border-athath-gold hover:bg-white hover:text-athath-ink'
                                                >
                                                        <Grid3x3 className='h-5 w-5' />
                                                        <span>
                                                                {activeCategoryName
                                                                        ? `${t("search.categories")} · ${activeCategoryName}`
                                                                        : t("search.categories")}
                                                        </span>
                                                </button>
                                        </div>
                                </div>
                        </form>

                        {supportsOverlay && showResults && (
                                <div className='rounded-[18px] border border-athath-gold/25 bg-white/95 p-4 text-athath-ink shadow-[0_20px_40px_rgba(0,0,0,0.08)]'>
                                        <div className='mb-3 flex items-center justify-between text-sm font-semibold text-athath-gold'>
                                                <span>{t("search.resultsTitle")}</span>
                                                {searching && <Loader2 className='h-4 w-4 animate-spin text-athath-gold' />}
                                        </div>

                                        {!searching && error && (
                                                <div className='rounded-[18px] border border-red-300/40 bg-red-100/30 p-4 text-sm text-red-700'>
                                                        {error}
                                                </div>
                                        )}

                                        {!searching && !error && results.length === 0 && query.trim() && (
                                                <div className='rounded-[18px] border border-athath-charcoal/10 bg-white/70 p-4 text-sm text-athath-ink/70'>
                                                        {t("search.noResults", { query })}
                                                </div>
                                        )}

                                        {(searching || results.length > 0) && (
                                                <ul className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
                                                        {results.map((product) => {
                                                                const { price, discountedPrice, isDiscounted } =
                                                                        getProductPricing(product);
                                                                const image = product.image || product.images?.[0]?.url;
                                                                return (
                                                                        <li key={product._id}>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => handleSelectProduct(product)}
                                                                                        className='group flex w-full items-center gap-4 rounded-[18px] border border-transparent bg-white/80 p-4 text-right text-athath-ink transition hover:-translate-y-1 hover:border-athath-gold/60 hover:bg-white shadow-sm hover:shadow-[0_14px_30px_rgba(201,162,39,0.18)]'
                                                                                >
                                                                                        <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-[18px] border border-athath-gold/20 bg-athath-cream/50'>
                                                                                                {image ? (
                                                                                                        <img
                                                                                                                src={image}
                                                                                                                alt={product.name}
                                                                                                                className='h-full w-full object-cover transition duration-300 group-hover:scale-105'
                                                                                                        />
                                                                                                ) : (
                                                                                                        <div className='flex h-full w-full items-center justify-center text-athath-ink/40'>
                                                                                                                <SearchIcon className='h-6 w-6' />
                                                                                                        </div>
                                                                                                )}
                                                                                        </div>
                                                                                        <div className='flex flex-1 flex-col items-start gap-1 text-right'>
                                                                                                <span className='text-base font-semibold text-athath-ink'>
                                                                                                        {product.name}
                                                                                                </span>
                                                                                                <p className='line-clamp-2 text-sm text-athath-ink/60'>
                                                                                                        {product.description}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className='flex flex-col items-end gap-1'>
                                                                                                {isDiscounted ? (
                                                                                                        <>
                                                                                                                <span className='text-xs text-athath-ink/50 line-through'>
                                                                                                                        {formatMRU(price)}
                                                                                                                </span>
                                                                                                                <span className='text-sm font-semibold text-athath-gold'>
                                                                                                                        {formatMRU(discountedPrice)}
                                                                                                                </span>
                                                                                                        </>
                                                                                                ) : (
                                                                                                        <span className='text-sm font-semibold text-athath-gold'>
                                                                                                                {formatMRU(price)}
                                                                                                        </span>
                                                                                                )}
                                                                                        </div>
                                                                                </button>
                                                                        </li>
                                                                );
                                                        })}
                                                </ul>
                                        )}
                                </div>
                        )}

                        {showCategories && (
                                <div className='rounded-[18px] border border-athath-gold/25 bg-white/95 p-4 text-athath-ink shadow-[0_20px_40px_rgba(0,0,0,0.08)]'>
                                        <div className='mb-3 flex items-center justify-between text-sm font-semibold text-athath-gold'>
                                                <span>{t("search.categoriesTitle")}</span>
                                                {categoriesLoading && <Loader2 className='h-4 w-4 animate-spin text-athath-gold' />}
                                        </div>

                                        {!categoriesLoading && categories.length === 0 && (
                                                <div className='rounded-[18px] border border-athath-charcoal/10 bg-white/70 p-4 text-sm text-athath-ink/70'>
                                                        {t("search.categoriesEmpty")}
                                                </div>
                                        )}

                                        {categories.length > 0 && (
                                                <ul className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
                                                        {variant !== "category" && selectedCategory && (
                                                                <li>
                                                                        <button
                                                                                type='button'
                                                                                onClick={handleClearCategorySelection}
                                                                                className='flex w-full items-center justify-between gap-3 rounded-[18px] border border-transparent bg-white/80 p-4 text-sm font-semibold text-athath-gold transition hover:-translate-y-1 hover:border-athath-gold/60 hover:bg-white shadow-sm hover:shadow-[0_12px_24px_rgba(201,162,39,0.18)]'
                                                                        >
                                                                                <span>{t("search.clearCategory")}</span>
                                                                        </button>
                                                                </li>
                                                        )}
                                                        {categories.map((category) => (
                                                                <li key={category._id}>
                                                                        <button
                                                                                type='button'
                                                                                onClick={() => handleSelectCategory(category)}
                                                                                className='flex w-full items-center justify-between gap-3 rounded-[18px] border border-athath-charcoal/10 bg-white/70 p-4 text-sm font-semibold text-athath-ink transition hover:-translate-y-1 hover:border-athath-gold/60 hover:bg-white shadow-sm hover:shadow-[0_10px_22px_rgba(201,162,39,0.15)]'
                                                                        >
                                                                                <span>{category.name}</span>
                                                                        </button>
                                                                </li>
                                                        ))}
                                                </ul>
                                        )}
                                </div>
                        )}
                </div>
        );
};

export default SearchBar;
