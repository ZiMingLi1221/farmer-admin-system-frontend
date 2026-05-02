/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // 使用 class 模式
  theme: {
    extend: {
      // ========== 顏色系統（Design Tokens） ==========
      colors: {
        // 主色系（農會綠）
        primary: {
          DEFAULT: '#00ad68',
          hover: '#008a53',
          light: 'rgb(0 173 104 / 20%)',
        },

        // 背景色系
        bg: {
          // 新語意化 token
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          overlay: 'var(--bg-overlay)',
          muted: 'var(--bg-muted)',
          // 舊 key 保留作為別名
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },

        // 文字色系
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },

        // 邊框色系
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
      },

      // ========== 字體系統 ==========
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Google Sans',
          'sans-serif',
        ],
      },

      // ========== 間距系統 ==========
      spacing: {
        'sidebar-main': '5rem', // 80px
        'sidebar-secondary': '16rem', // 256px
        'sidebar-combined': '21rem', // 336px
      },

      // ========== 圓角系統 ==========
      borderRadius: {
        xs: '2px', // Badge、極小元素
        sm: '8px', // 按鈕、Input
        DEFAULT: '8px',
        md: '10px', // 卡片、彈窗
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },

      // ========== 陰影系統 ==========
      boxShadow: {
        soft: '0 2px 8px rgb(0 0 0 / 8%)',
        'soft-dark': '0 2px 8px rgb(0 0 0 / 30%)',
        card: '0 1px 3px rgb(0 0 0 / 10%)',
      },

      // ========== 動畫時長 ==========
      transitionDuration: {
        DEFAULT: '300ms',
      },

      // ========== Z-index 層級 ==========
      zIndex: {
        'sidebar-main': '50',
        'sidebar-secondary': '40',
        header: '30',
        modal: '100',
      },

      // ========== 背景模糊（玻璃擬態） ==========
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};
