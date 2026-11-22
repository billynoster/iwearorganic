import type {Config} from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: ({ theme }: { theme: any }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-invert-body': 'hsl(var(--foreground))',
            '--tw-prose-invert-headings': 'hsl(var(--foreground))',
            '--tw-prose-invert-lead': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-links': 'hsl(var(--foreground))',
            '--tw-prose-invert-bold': 'hsl(var(--foreground))',
            '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-bullets': 'hsl(var(--border))',
            '--tw-prose-invert-hr': 'hsl(var(--border))',
            '--tw-prose-invert-quotes': 'hsl(var(--foreground))',
            '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-code': 'hsl(var(--foreground))',
            '--tw-prose-invert-pre-code': 'hsl(var(--foreground))',
            '--tw-prose-invert-pre-bg': 'hsl(var(--card))',
            '--tw-prose-invert-thead': 'hsl(var(--foreground))',
            '--tw-prose-invert-th-borders': 'hsl(var(--border))',
            '--tw-prose-invert-td-borders': 'hsl(var(--border))',
          },
        },
      }),
      fontFamily: {
        body: ['var(--font-body)', 'Sora', 'system-ui', 'sans-serif'],
        brand: ['var(--font-brand)', 'Sora', 'system-ui', 'sans-serif'],
        display: ['var(--font-body)', 'Sora', 'system-ui', 'sans-serif'],
        editorial: ['var(--font-editorial)', 'Sora', 'system-ui', 'sans-serif'],
        heading: ['var(--font-body)', 'Sora', 'system-ui', 'sans-serif'],
        headline: ['var(--font-body)', 'Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        forest: 'var(--color-forest)',
        cotton: 'var(--color-cotton)',
        soil: 'var(--color-soil)',
        sage: 'var(--color-sage)',
        clay: 'var(--color-clay)',
        surface: 'var(--color-surface)',
        'text-secondary': 'var(--color-text-secondary)',
        /* Legacy aliases → brand kit */
        linen: 'var(--ca-linen)',
        oat: 'var(--ca-oat)',
        'dusk-rose': 'var(--ca-dusk-rose)',
        'haze-blue': 'var(--ca-haze-blue)',
        'mineral-ink': 'var(--ca-mineral-ink)',
        white: 'var(--ca-white)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ca-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ca-slow-pan': {
          '0%': { transform: 'scale(1.08) translate3d(0, 0, 0)' },
          '100%': { transform: 'scale(1) translate3d(0, -1.5%, 0)' },
        },
        'ca-ink-in': {
          '0%': { opacity: '0', letterSpacing: '0.4em' },
          '100%': { opacity: '1', letterSpacing: '0.18em' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'marquee': 'marquee 10s linear infinite',
        'ca-fade-up': 'ca-fade-up 0.9s ease-out both',
        'ca-slow-pan': 'ca-slow-pan 18s ease-out both',
        'ca-ink-in': 'ca-ink-in 1.1s ease-out both',
      },
      boxShadow: {
        DEFAULT: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        sm: '0 1px 1px 0 rgb(0 0 0 / 0.03)',
        lg: '0 2px 8px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
