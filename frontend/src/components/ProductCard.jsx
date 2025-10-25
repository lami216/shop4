import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";

const ProductCard = ({ product }) => {
        const { addToCart } = useCartStore();
        const { t } = useTranslation();
        const { price, discountedPrice, isDiscounted, discountPercentage } = getProductPricing(product);
        const productForCart = {
                ...product,
                discountedPrice,
                isDiscounted,
                discountPercentage,
        };
        const coverImage =
                product.image ||
                (Array.isArray(product.images) && product.images.length > 0
                        ? typeof product.images[0] === "string"
                                ? product.images[0]
                                : product.images[0]?.url
                        : "");

        const handleAddToCart = () => {
                addToCart(productForCart);
        };

        return (
                <div className='group relative flex w-full flex-col overflow-hidden rounded-[18px] border border-athath-gold/20 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-athath-gold/60 hover:shadow-[0_30px_50px_rgba(201,162,39,0.2)] sm:aspect-[3/4] lg:aspect-square'>
                        <Link
                                to={`/products/${product._id}`}
                                className='relative aspect-[4/5] w-full overflow-hidden min-h-[14rem] sm:min-h-0 sm:aspect-square'
                                aria-label={t("product.viewDetails", { name: product.name })}
                        >
                                {isDiscounted && (
                                        <span className='absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-lg'>
                                                -{discountPercentage}%
                                        </span>
                                )}
                                {coverImage ? (
                                        <img
                                                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                                                src={coverImage}
                                                alt={product.name}
                                        />
                                ) : (
                                        <div className='flex h-full w-full items-center justify-center bg-athath-cream text-sm text-athath-ink/60'>
                                                {t("common.status.noImage")}
                                        </div>
                                )}
                        </Link>

                        <div className='mt-4 flex flex-1 flex-col px-5 pb-5 text-athath-ink'>
                                <Link to={`/products/${product._id}`} className='block transition-colors duration-300 hover:text-athath-gold'>
                                        <h5 className='text-lg font-semibold tracking-tight'>{product.name}</h5>
                                </Link>
                                <div className='mt-3 flex flex-wrap items-baseline gap-2'>
                                        {isDiscounted ? (
                                                <>
                                                        <span className='max-w-full break-words text-sm text-athath-ink/50 line-through'>{formatMRU(price)}</span>
                                                        <span className='max-w-full break-words text-lg font-bold text-athath-gold'>{formatMRU(discountedPrice)}</span>
                                                </>
                                        ) : (
                                                <span className='max-w-full break-words text-lg font-semibold leading-tight text-athath-gold'>
                                                        {formatMRU(price)}
                                                </span>
                                        )}
                                </div>
                                <button
                                        className='mt-auto flex items-center justify-center gap-2 rounded-[18px] bg-athath-gold px-5 py-2 text-sm font-medium text-athath-ink on-gold transition-colors duration-300 hover:bg-[#b89322] focus:outline-none focus:ring-4 focus:ring-athath-gold/40'
                                        onClick={handleAddToCart}
                                >
                                        <ShoppingCart size={20} />
                                        {t("common.actions.addToCart")}
                                </button>
                        </div>
                </div>
        );
};
export default ProductCard;
