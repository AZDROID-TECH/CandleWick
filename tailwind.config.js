/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Ubuntu', 'sans-serif'],
            },
            colors: {
                // Custom neon colors if needed, but Tailwind defaults are usually fine
                wick: {
                    green: '#22c55e', // Bullish
                    red: '#ef4444',   // Bearish
                }
            }
        },
    },
    plugins: [],
}
