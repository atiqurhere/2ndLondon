import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'rgb(13, 13, 13)',
                foreground: 'rgb(250, 250, 250)',
                primary: 'rgb(255, 255, 255)',
                muted: 'rgb(163, 163, 163)',
                surface: 'rgb(28, 28, 28)',
                border: 'rgb(38, 38, 38)',
                success: 'rgb(34, 197, 94)',
                danger: 'rgb(239, 68, 68)',
            },
            borderRadius: {
                card: '12px',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            scale: {
                '102': '1.02',
            },
        },
    },
    plugins: [],
};

export default config;
