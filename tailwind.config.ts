import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        /* 主色：科技藍 —— 專業、信任 */
        brand: {
          50: '#EEF5FF',
          100: '#D9E8FF',
          200: '#B5D1FF',
          300: '#84B2FF',
          400: '#4A8DFF',
          500: '#0A6CFF',
          600: '#0052D9',
          700: '#0042AE',
          800: '#003687',
          900: '#002D6B',
        },
        /* 強調色：活力橙 —— 緊迫、轉化 */
        accent: {
          50: '#FFF4EB',
          100: '#FFE5CC',
          200: '#FFC894',
          300: '#FFA55C',
          400: '#FF8A2B',
          500: '#FF6A00',
          600: '#E25A00',
          700: '#B84800',
          800: '#8F3800',
          900: '#6B2A00',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F7FA',
          soft: '#EEF3FB',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          faint: '#94A3B8',
        },
        state: {
          success: '#16A34A',
          danger: '#DC2626',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans HK"',
          '"Noto Sans TC"',
          '"Source Han Sans HC"',
          '"PingFang HK"',
          '"Microsoft JhengHei"',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '"Noto Sans HK"',
          '"Noto Sans TC"',
          '"PingFang HK"',
          '"Microsoft JhengHei"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-lg': ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        display: ['clamp(2rem, 4vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        headline: ['clamp(1.5rem, 2.6vw, 2rem)', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        subhead: ['1.25rem', { lineHeight: '1.45', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.75', fontWeight: '400' }],
        caption: ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05)',
        card: '0 2px 4px rgba(15, 23, 42, 0.04), 0 12px 28px rgba(15, 23, 42, 0.07)',
        lift: '0 8px 16px rgba(15, 23, 42, 0.06), 0 24px 48px rgba(10, 108, 255, 0.13)',
        brand: '0 10px 30px rgba(10, 108, 255, 0.28)',
        cta: '0 10px 26px rgba(255, 106, 0, 0.34)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'grid-slate':
          'linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)',
        'brand-gradient': 'linear-gradient(135deg, #0A6CFF 0%, #0052D9 55%, #002D6B 100%)',
        'cta-gradient': 'linear-gradient(135deg, #FF8A2B 0%, #FF6A00 55%, #E25A00 100%)',
        'soft-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 100%)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,106,0,0.45)' },
          '70%': { boxShadow: '0 0 0 14px rgba(255,106,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,106,0,0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'slide-in-right': 'slide-in-right 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.66, 0, 0, 1) infinite',
        marquee: 'marquee 32s linear infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
