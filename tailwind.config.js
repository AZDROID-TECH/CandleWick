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
            wick: {
                green: '#22c55e',
                red: '#ef4444',
            }
        }
    },
    },
    plugins: [],
}
