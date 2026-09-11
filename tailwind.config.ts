// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* CSS Variable Integrations */
        'bg-midnight': 'var(--bg-midnight)',
        'bg-deep': 'var(--bg-deep)',
        'bg-navy': 'var(--bg-navy)',
        'bg-royal': 'var(--bg-royal)',
        'bg-surface': 'var(--bg-surface)',
        
        'brand-deep': 'var(--brand-deep)',
        'brand-primary': 'var(--brand-primary)',
        'brand-royal': 'var(--brand-royal)',
        'brand-bright': 'var(--brand-bright)',
        'brand-light': 'var(--brand-light)',
        'brand-pale': 'var(--brand-pale)',

        'gold-pale': 'var(--gold-pale)',
        'gold-light': 'var(--gold-light)',
        'gold-primary': 'var(--gold-primary)',
        'gold-warm': 'var(--gold-warm)',
        'gold-deep': 'var(--gold-deep)',
        'gold-dark': 'var(--gold-dark)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        'text-gold': 'var(--text-gold)',
        'text-gold-pale': 'var(--text-gold-pale)',

        'status-available': 'var(--status-available)',
        'status-reserved': 'var(--status-reserved)',
        'status-sold': 'var(--status-sold)',
        'status-soon': 'var(--status-soon)',
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
        tajawal: ['var(--font-tajawal)', 'sans-serif'],
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
