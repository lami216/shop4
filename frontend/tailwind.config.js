/** @type {import('tailwindcss').Config} */
export default {
        content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
        theme: {
                extend: {
                        colors: {
                                "athath-ivory": "#F5F3EF",
                                "athath-cream": "#E7DFD3",
                                "athath-white": "#FFFFFF",
                                "athath-charcoal": "#2C2C2C",
                                "athath-ink": "#1C1C1C",
                                "athath-gold": "#C9A227",
                                "athath-wood": "#8B5E3C",
                                "athath-input": "#B8B3A5",
                                "athath-placeholder": "#7A7A7A",
                                "athath-focus": "#E2C45A",
                        },
                },
        },
        plugins: [],
};
