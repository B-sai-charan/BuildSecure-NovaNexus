/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#070A13',
        surface: '#0E1322',
        'surface-light': '#182035',
        'surface-card': '#12182B',
        'surface-elevated': '#1C2540',
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        cyber: {
          blue: '#00F0FF',
          green: '#00FF9D',
          purple: '#9D00FF',
          amber: '#FFB800',
          rose: '#FF0055',
          slate: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'neon-emerald': '0 0 25px -3px rgba(16, 185, 129, 0.3), 0 0 10px -2px rgba(16, 185, 129, 0.2)',
        'neon-cyan': '0 0 25px -3px rgba(6, 182, 212, 0.3), 0 0 10px -2px rgba(6, 182, 212, 0.2)',
        'neon-purple': '0 0 25px -3px rgba(139, 92, 246, 0.3), 0 0 10px -2px rgba(139, 92, 246, 0.2)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'glow-spin': 'spin 12s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
