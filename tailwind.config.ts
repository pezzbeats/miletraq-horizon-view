
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
				'display': ['Roboto', 'sans-serif'],
			},
			screens: {
				'xs': '320px',
				'sm-mobile': '375px',
				'md-mobile': '390px',
				'lg-mobile': '414px',
				'xl-mobile': '428px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				glass: {
					DEFAULT: 'var(--glass-background)',
					border: 'var(--glass-border)'
				},
				automotive: {
					navy: 'var(--primary-navy)',
					blue: 'var(--primary-blue)',
					dark: 'var(--primary-dark)',
					orange: 'var(--accent-orange)',
					green: 'var(--accent-green)',
					red: 'var(--accent-red)',
					gray: 'var(--neutral-gray)',
					light: 'var(--neutral-light)',
					white: 'var(--neutral-white)',
					black: 'var(--neutral-dark)',
					success: 'var(--status-success)',
					warning: 'var(--status-warning)',
					danger: 'var(--status-danger)',
					info: 'var(--status-info)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in-scale': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-4px)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)'
					},
					'50%': {
						boxShadow: '0 0 0 8px hsl(var(--primary) / 0)'
					}
				},
				'gear-rotate': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				},
				'fuel-pump': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' }
				},
				'speedometer-sweep': {
					from: { transform: 'rotate(-90deg)' },
					to: { transform: 'rotate(90deg)' }
				},
				'engine-start': {
					'0%': { opacity: '0', transform: 'scale(0.8)' },
					'50%': { opacity: '0.8', transform: 'scale(1.1)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'led-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' }
				},
				'dashboard-glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgb(59 130 246)' },
					'50%': { boxShadow: '0 0 20px rgb(59 130 246)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-scale': 'fade-in-scale 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'gear-rotate': 'gear-rotate 2s linear infinite',
				'fuel-pump': 'fuel-pump 1s ease-in-out infinite',
				'speedometer-sweep': 'speedometer-sweep 1s ease-out',
				'engine-start': 'engine-start 0.8s ease-out',
				'led-pulse': 'led-pulse 2s ease-in-out infinite',
				'dashboard-glow': 'dashboard-glow 3s ease-in-out infinite'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			const newUtilities = {
				'.touch-target': {
					minHeight: '44px',
					minWidth: '44px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				},
				'.mobile-card': {
					borderRadius: '12px',
					padding: '16px',
					backgroundColor: 'hsl(var(--card))',
					border: '1px solid hsl(var(--border))',
					boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
				},
				'.mobile-input': {
					height: '48px',
					fontSize: '16px',
					borderRadius: '8px'
				},
				'.safe-area-inset': {
					paddingTop: 'env(safe-area-inset-top)',
					paddingBottom: 'env(safe-area-inset-bottom)',
					paddingLeft: 'env(safe-area-inset-left)',
					paddingRight: 'env(safe-area-inset-right)'
				}
			}
			addUtilities(newUtilities)
		}
	],
} satisfies Config;
