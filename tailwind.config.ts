import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // BeReal-inspired dark theme
                background: "#0B0B0F",
                surface: "#15151C",
                primary: "#FFFFFF",
                muted: "#A1A1AA",
                success: "#22C55E",
                warning: "#F97316",
                danger: "#EF4444",
                border: "#27272A",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                card: '12px',
            },
        },
    },
    plugins: [],
};

export default config;
