import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";

const CategoryItem = ({ category }) => {
        const { t } = useTranslation();
        return (
                <div className='group relative h-96 w-full overflow-hidden rounded-[18px] border border-athath-gold/15 shadow-[0_18px_36px_rgba(0,0,0,0.12)]'>
                        <Link to={`/category/${category.slug}`}>
                                <div className='w-full h-full cursor-pointer'>
                                        <div className='absolute inset-0 z-10 bg-gradient-to-b from-transparent via-athath-cream/40 to-athath-charcoal/80 transition-opacity duration-500 group-hover:opacity-95' />
                                        <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110'
                                                loading='lazy'
                                        />
                                        <div className='absolute bottom-0 left-0 right-0 z-20 p-6'>
                                                <h3 className='mb-1 text-2xl font-semibold text-white drop-shadow-lg'>{category.name}</h3>
                                                <p className='text-sm text-athath-gold/90'>
                                                        {t("categories.explore", { category: category.name })}
                                                </p>
                                        </div>
                                </div>
                        </Link>
                </div>
        );
};

export default CategoryItem;
