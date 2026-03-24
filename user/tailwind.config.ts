import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // === COLORS ===
      colors: {
        // === ULTRA-LUXURY CORE PALETTE ===
        // Replaced old 'creme' with 'Travertine' (Rich, stony beige, not just off-white)
        // creme: "#fffde2ff",
        creme: "#fffef6ff",
        productcardbg : "#fdfff6ff",

        // Replaced 'alpha' with 'Warm Obsidian' (Charcoal with brown undertones, softer than black)
        alpha: "#262524",

        // Replaced 'tango' with 'Aged Bronze' (Sophisticated metallic brown/green)
        tango: "#4A453C",

        // === SURFACES & LAYERS ===
        ivory: "#F5F4F0",      // Lighter layer (High-end paper)
        wind: "#D6D3CD",       // Muted Stone (previously minty green)
        sand: "#DEDBD6",       // Darker Travertine
        charcoal: "#302F2D",   // Lighter Obsidian for cards

        hover: {
          // === FUNCTIONAL / UI ===
          light: "#E1DFDA",    // Subtle interaction on creme
          dark: "#1A1918",     // Deepest interaction
          accent: "#38342E",   // Darker Bronze
        },

        button: {
          primary: "#262524",      // Warm Obsidian
          secondary: "#4A453C",    // Aged Bronze
          outline: "transparent",
          disabled: "#A6A29A",     // Stone Grey
        },

        text: {
          primary: "#262524",      // High contrast
          secondary: "#5C5954",    // Medium contrast stone
          muted: "#918E88",        // Low contrast limestone
          inverse: "#F5F4F0",      // Light on dark
        },

        border: {
          light: "#DEDBD6",        // Stone border
          medium: "#C9C6C0",       // Structured border
          dark: "#454340",         // Dark mode border
        },

        // === LUXURY ACCENTS ===
        gold: "#9C825C",           // Antique Gold (Desaturated, realistic)
        copper: "#8C6A54",         // Tuscan Leather
        sage: "#7D8275",           // Dried Olive
        blush: "#Cfb9b9",          // Cashmere
        slate: "#5E6369",          //Pewter

        // === SEMANTIC ===
        success: "#4A5D4F",        // Deep Forest
        error: "#8C4B4B",          // Brick Red
        warning: "#9C825C",        // Gold
        info: "#5C6B7F",           // Steel Blue
      },

      // === LUXURY TYPOGRAPHY ADJUSTMENTS ===
      letterSpacing: {
        'tight': '-0.03em',        // Tighter for large headings (Fashion style)
        'wide': '0.08em',          // Wider for elegance
        'wider': '0.2em',          // Extremely spaced for 'luxury' labels
      },

      // === SPACING ===
      spacing: {
        'section': '100px',        // More breathing room
        'section-mobile': '24px',
        'container': '12px',
      },

      // === BORDER RADIUS ===
      borderRadius: {
        'card': '2px',             // Sharper, more architectural
        'button': '0px',           // Square buttons (Modern luxury)
        'badge': '100px',          // Pill shape
      },

      // === BOX SHADOWS (Subtle & diffused) ===
      boxShadow: {
        'card': '0 10px 40px -10px rgba(38, 37, 36, 0.05)', // Very subtle, warm shadow
        'card-hover': '0 20px 60px -15px rgba(38, 37, 36, 0.1)',
        'product-card': '0 0 0 1px rgba(38, 37, 36, 0.06), 0 2px 4px rgba(38, 37, 36, 0.08), 0 8px 16px -4px rgba(38, 37, 36, 0.1)',
        'product-card-hover': '0 0 0 1px rgba(38, 37, 36, 0.08), 0 4px 8px rgba(38, 37, 36, 0.12), 0 16px 32px -8px rgba(38, 37, 36, 0.15)',
        'dropdown': '0 4px 20px rgba(38, 37, 36, 0.08)',
        'modal': '0 24px 80px rgba(38, 37, 36, 0.15)',
      },

      // === TRANSITIONS ===
      transitionDuration: {
        'fast': '200ms',
        'normal': '400ms',     // Slower, more deliberate movement
        'slow': '700ms',
      },

      // === TYPOGRAPHY ===
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'h1': ['3rem', { lineHeight: '1.1' }],
        'h2': ['2.25rem', { lineHeight: '1.2' }],
        'h3': ['1.5rem', { lineHeight: '1.3' }],
        'body': ['1.0625rem', { lineHeight: '1.7' }], // Slightly larger body
        'small': ['0.9375rem', { lineHeight: '1.5' }],
        'caption': ['0.8125rem', { lineHeight: '1.4' }],
      },

      lineHeight: {
        'tight': '1.1',
        'snug': '1.3',
        'relaxed': '1.8',
      },

      // === MAX WIDTHS ===
      maxWidth: {
        'content': '1440px',       // Wider canvas
        'narrow': '680px',
      },

      // === Z-INDEX ===
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'modal': '300',
        'toast': '400',
      },

      // === ASPECT RATIOS ===
      aspectRatio: {
        'product': '4 / 5',        // Slightly taller portrait
        'hero': '16 / 9',
        'square': '1 / 1',
        'wide': '21 / 9',
      },

      // === BACKDROP BLUR ===
      backdropBlur: {
        'light': '12px',
        'heavy': '32px',
      },

      // === GRID TEMPLATES ===
      gridTemplateColumns: {
        'products': 'repeat(auto-fill, minmax(320px, 1fr))', // Wider cards
        'gallery': 'repeat(auto-fill, minmax(240px, 1fr))',
      },

      // === BACKGROUND IMAGES ===
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-overlay': 'linear-gradient(to bottom, transparent 0%, rgba(38, 37, 36, 0.5) 100%)',
        'gradient-hero': 'linear-gradient(to right, rgba(38, 37, 36, 0.7) 0%, transparent 70%)',
      },

      // === SCALE ===
      scale: {
        '102': '1.02',
        '103': '1.03',
      },

      // === BLUR ===
      blur: {
        'xs': '2px',
      },

      // === ANIMATIONS ===
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slide-up 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slide-down 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        'reveal': 'reveal 1s cubic-bezier(0.22, 1, 0.36, 1)',
      },

      // === FONTS ===
      fontFamily: {
        primary: ["var(--font-hammersmith)", "sans-serif"],
        secondary: ["var(--font-playfair)", "serif"],
        brand: ["brand-primary", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        abril: ["var(--font-abril)", "serif"],
      },
    },

    // === SCREENS (Breakpoints) ===
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px', // Added ultra-wide support
    },
  },
  plugins: [],
};

export default config;
