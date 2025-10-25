import { useEffect } from "react";
import useTranslation from "../hooks/useTranslation";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { useCategoryStore } from "../stores/useCategoryStore";
import SearchBar from "../components/SearchBar";

const HomePage = () => {
        const { fetchFeaturedProducts, products, loading: productsLoading } = useProductStore();
        const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
        const { t } = useTranslation();

        useEffect(() => {
                fetchFeaturedProducts();
        }, [fetchFeaturedProducts]);

        useEffect(() => {
                fetchCategories();
        }, [fetchCategories]);

        return (
                <div className='relative min-h-screen overflow-hidden'>
                        <div className='relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
                                <section
                                        className='relative overflow-hidden rounded-[24px] border border-athath-gold/20 bg-athath-cream shadow-[0_30px_60px_rgba(0,0,0,0.12)]'
                                        style={{
                                                backgroundImage:
                                                        "url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80')",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                        }}
                                >
                                        <div className='absolute inset-0 bg-white/60 backdrop-blur-sm' />
                                        <div className='relative z-10 flex flex-col items-center px-6 py-16 text-center text-athath-charcoal sm:px-10 lg:px-16'>
                                                <h1 className='mb-4 text-4xl font-bold text-athath-gold sm:text-5xl lg:text-6xl'>
                                                        {t("home.titleLine1")}
                                                </h1>
                                                <p className='mb-8 max-w-2xl text-lg text-athath-charcoal/80'>
                                                        {t("home.subtitle")}
                                                </p>
                                                <h2 className='mb-10 text-3xl font-semibold text-athath-wood'>اكتشف أناقة منزلك</h2>
                                                <p className='mb-10 text-base text-athath-charcoal/70'>أثاث فاخر بتصاميم تجمع بين الجمال والراحة</p>
                                                <div className='w-full max-w-3xl'>
                                                        <SearchBar />
                                                </div>
                                        </div>
                                </section>

                                <div className='mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                        {categories.length === 0 && !categoriesLoading && (
                                                <div className='col-span-full rounded-[18px] border border-athath-gold/20 bg-white/80 p-8 text-center text-athath-charcoal/60 shadow-sm'>
                                                        {t("categories.manager.list.empty")}
                                                </div>
                                        )}
                                        {categories.map((category) => (
                                                <CategoryItem category={category} key={category._id} />
                                        ))}
                                </div>

                                {!productsLoading && products.length > 0 && (
                                        <div className='mt-16'>
                                                <FeaturedProducts featuredProducts={products} />
                                        </div>
                                )}
                        </div>
                </div>
        );
};
export default HomePage;
