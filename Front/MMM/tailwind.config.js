// tailwind.config.js
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    safelist: [
    // 애니메이션
    "animate-fade-in-up",

    // ToastContainer: margin-top
    "mt-4",

    // 토스트 박스 공통
    "w-11/12", "max-w-md", "sm:w-96", "mx-auto",
    "rounded-lg", "shadow-md", "p-3", "mb-4", "flex", "items-start",

    // 색상: 배경 & 텍스트
    "bg-blue-600", "bg-green-600", "bg-red-600", "bg-yellow-600",
    "text-white",

    // border
    "border-l-4",
    "border-green-500", "border-red-500", "border-yellow-500", "border-transparent",

    // 본문 텍스트
    "ml-3", "text-sm", "leading-snug",
    ],
    theme: {
    extend: {
        keyframes: {
        fadeInUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        },
        animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        },
        screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        },
    },
    },
    plugins: [],
};
