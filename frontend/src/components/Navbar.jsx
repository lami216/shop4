import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
        const { user, logout } = useUserStore();
        const isAdmin = user?.role === "admin";
        const { cart } = useCartStore();
        const cartItemCount = cart.reduce((total, item) => total + (item.quantity ?? 0), 0);
        const { t } = useTranslation();

        const cartLink = (
                <Link
                        to={'/cart'}
                        className='relative group flex items-center gap-2 rounded-[18px] bg-white/70 px-5 py-2 text-sm font-semibold text-athath-ink transition duration-200 hover:bg-white/95 hover:shadow-[0_8px_18px_rgba(0,0,0,0.08)]'
                >
                        <ShoppingCart size={18} />
                        <span className='hidden sm:inline'>{t("nav.cart")}</span>
                        {cartItemCount > 0 && (
                                <span className='absolute -top-2 -right-2 rounded-full bg-athath-gold px-2 py-0.5 text-xs font-semibold text-athath-ink on-gold shadow-[0_4px_12px_rgba(201,162,39,0.4)] transition duration-200 group-hover:bg-[#b89322]'>
                                        {cartItemCount}
                                </span>
                        )}
                </Link>
        );

        return (
                <header className='fixed top-0 right-0 z-40 w-full bg-transparent'>
                        <div className='container mx-auto px-4 py-4'>
                                <div className='flex items-center justify-between rounded-[22px] border border-white/40 bg-athath-cream/90 px-5 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl'>
                                        <Link to='/' className='flex items-center gap-4 text-athath-ink'>
                                                <span className='flex h-12 w-12 items-center justify-center rounded-full border border-athath-cream/60 bg-white/60 shadow-inner'>
                                                        <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                viewBox='0 0 64 64'
                                                                className='h-8 w-8 text-athath-gold'
                                                        >
                                                                <circle cx='32' cy='32' r='29' fill='none' stroke='rgba(44,44,44,0.15)' strokeWidth='2.5' />
                                                                <path
                                                                        d='M20 36h24l3 12H17l3-12zm6-18h12c1.7 0 3 1.3 3 3v9H23v-9c0-1.7 1.3-3 3-3z'
                                                                        fill='none'
                                                                        stroke='currentColor'
                                                                        strokeWidth='2.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                />
                                                        </svg>
                                                </span>
                                                <span className='text-3xl font-semibold tracking-tight text-athath-gold'>الأثاث ستور</span>
                                        </Link>

                                        <div className='flex flex-wrap items-center justify-end gap-4 text-sm font-medium'>
                                                <nav className='flex items-center gap-4 text-athath-ink/70'>
                                                        <Link
                                                                to={'/'}
                                                                className='rounded-[14px] px-4 py-2 transition duration-200 hover:bg-white/80 hover:text-athath-ink hover:shadow-[0_6px_14px_rgba(0,0,0,0.1)]'
                                                        >
                                                                {t("nav.home")}
                                                        </Link>
                                                        {isAdmin && (
                                                                <Link
                                                                        className='flex items-center gap-2 rounded-[18px] bg-athath-charcoal px-4 py-2 text-athath-white transition duration-200 hover:bg-black/80'
                                                                        to={'/secret-dashboard'}
                                                                >
                                                                        <Lock className='inline-block' size={18} />
                                                                        <span className='hidden sm:inline'>{t("nav.dashboard")}</span>
                                                                </Link>
                                                        )}
                                                </nav>

                                                <div className='flex items-center gap-3'>
                                                        {cartLink}
                                                        {user ? (
                                                                <button
                                                                        className='flex items-center gap-2 rounded-[18px] bg-white/70 px-5 py-2 text-athath-ink transition duration-200 hover:bg-white/95 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]'
                                                                        onClick={logout}
                                                                >
                                                                        <LogOut size={18} />
                                                                        <span className='hidden sm:inline'>{t("nav.logout")}</span>
                                                                </button>
                                                        ) : (
                                                                <>
                                                                        <Link
                                                                                to={'/signup'}
                                                                                className='flex items-center gap-2 rounded-[18px] bg-athath-gold px-5 py-2 font-semibold text-athath-ink on-gold transition duration-200 hover:bg-[#b89322] hover:shadow-[0_12px_24px_rgba(201,162,39,0.35)]'
                                                                        >
                                                                                <UserPlus size={18} />
                                                                                {t("nav.signup")}
                                                                        </Link>
                                                                        <Link
                                                                                to={'/login'}
                                                                                className='flex items-center gap-2 rounded-[18px] border border-athath-charcoal/10 bg-white/70 px-5 py-2 font-semibold text-athath-ink transition duration-200 hover:bg-white/95 hover:shadow-[0_12px_22px_rgba(0,0,0,0.08)]'
                                                                        >
                                                                                <LogIn size={18} />
                                                                                {t("nav.login")}
                                                                        </Link>
                                                                </>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </div>
                </header>
        );
};
export default Navbar;
