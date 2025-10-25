import SocialLinks from "./SocialLinks";

const Footer = () => {
        const buildTime = new Date(import.meta.env.VITE_BUILD_TIME).toLocaleString();
        return (
                <footer className='mt-20 bg-athath-charcoal text-white'>
                        <div className='container mx-auto flex flex-col items-center gap-4 px-4 py-10 text-center'>
                                <SocialLinks />
                                <p className='text-sm text-white/80'>آخر تحديث للموقع: {buildTime}</p>
                                <p className='text-sm font-medium'>الأثاث ستور جميع الحقوق محفوظة 2025</p>
                        </div>
                </footer>
        );
};

export default Footer;
