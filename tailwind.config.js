import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	safelist: ['dark'],
	plugins: [require('@tailwindcss/typography')],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--ds-radius-lg)',
				md: 'var(--ds-radius-md)',
				sm: 'var(--ds-radius-sm)',
				xl: 'var(--ds-radius-xl)',
				'2xl': 'var(--ds-radius-2xl)',
			},
			fontFamily: {
				sans: ['Noto Sans SC', 'Source Han Sans SC', ...fontFamily.sans],
				display: ['Iowan Old Style', 'Charter', 'Georgia', 'Noto Serif SC', 'serif'],
				serif: ['Iowan Old Style', 'Charter', 'Georgia', 'Noto Serif SC', 'serif'],
				mono: ['JetBrains Mono', 'IBM Plex Mono', ...fontFamily.mono]
			},
			animation: {
				'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
				'float': 'float 6s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUp: {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				scaleIn: {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
			},
			transitionTimingFunction: {
				'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': 'oklch(35% 0.018 60)',
						'--tw-prose-headings': 'oklch(14% 0.025 60)',
						'--tw-prose-lead': 'oklch(48% 0.015 60)',
						'--tw-prose-links': 'oklch(52% 0.08 115)',
						'--tw-prose-bold': 'oklch(14% 0.025 60)',
						'--tw-prose-counters': 'oklch(48% 0.015 60)',
						'--tw-prose-bullets': 'oklch(82% 0.015 75)',
						'--tw-prose-hr': 'oklch(89% 0.012 80)',
						'--tw-prose-quotes': 'oklch(20% 0.02 60)',
						'--tw-prose-quote-borders': 'oklch(52% 0.08 115)',
						'--tw-prose-captions': 'oklch(48% 0.015 60)',
						'--tw-prose-code': 'oklch(14% 0.025 60)',
						'--tw-prose-pre-code': 'oklch(84% 0.008 72)',
						'--tw-prose-pre-bg': 'oklch(15% 0.008 75)',
						'--tw-prose-th-borders': 'oklch(82% 0.015 75)',
						'--tw-prose-td-borders': 'oklch(89% 0.012 80)',
						'--tw-prose-invert-body': 'oklch(70% 0.01 70)',
						'--tw-prose-invert-headings': 'oklch(92% 0.005 75)',
						'--tw-prose-invert-lead': 'oklch(60% 0.012 70)',
						'--tw-prose-invert-links': 'oklch(57% 0.065 115)',
						'--tw-prose-invert-bold': 'oklch(92% 0.005 75)',
						'--tw-prose-invert-counters': 'oklch(60% 0.012 70)',
						'--tw-prose-invert-bullets': 'oklch(38% 0.015 72)',
						'--tw-prose-invert-hr': 'oklch(31% 0.012 72)',
						'--tw-prose-invert-quotes': 'oklch(84% 0.008 72)',
						'--tw-prose-invert-quote-borders': 'oklch(57% 0.065 115)',
						'--tw-prose-invert-captions': 'oklch(60% 0.012 70)',
						'--tw-prose-invert-code': 'oklch(92% 0.005 75)',
						'--tw-prose-invert-pre-code': 'oklch(70% 0.01 70)',
						'--tw-prose-invert-pre-bg': 'oklch(19% 0.008 75)',
						'--tw-prose-invert-th-borders': 'oklch(38% 0.015 72)',
						'--tw-prose-invert-td-borders': 'oklch(31% 0.012 72)',
					},
				},
			}),
		}
	}
}

export default config
