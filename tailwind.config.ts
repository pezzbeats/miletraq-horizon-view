
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
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
				// Automotive Color Palette
				automotive: {
					navy: 'hsl(var(--automotive-navy))',
					orange: 'hsl(var(--automotive-orange))',
					blue: 'hsl(var(--automotive-blue))',
					green: 'hsl(var(--automotive-green))',
					yellow: 'hsl(var(--automotive-yellow))',
					red: 'hsl(var(--automotive-red))',
					charcoal: 'hsl(var(--automotive-charcoal))'
				},
				dashboard: {
					DEFAULT: 'hsl(var(--dashboard-background))',
					foreground: 'hsl(var(--dashboard-foreground))',
					accent: 'hsl(var(--dashboard-accent))'
				},
				gauge: {
					green: 'hsl(var(--gauge-green))',
					yellow: 'hsl(var(--gauge-yellow))',
					red: 'hsl(var(--gauge-red))',
					blue: 'hsl(var(--gauge-blue))'
				},
				glass: {
					DEFAULT: 'var(--glass-background)',
					border: 'var(--glass-border)'
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
				// Automotive-specific animations
				'odometer-roll': {
					'0%': {
						transform: 'translateY(0px)',
						opacity: '1'
					},
					'50%': {
						transform: 'translateY(-10px)',
						opacity: '0.5'
					},
					'100%': {
						transform: 'translateY(0px)',
						opacity: '1'
					}
				},
				'speedometer-sweep': {
					'0%': {
						transform: 'rotate(-90deg)'
					},
					'100%': {
						transform: 'rotate(45deg)'
					}
				},
				'fuel-flow': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scaleY(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scaleY(0.98)'
					}
				},
				'led-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)',
						boxShadow: '0 0 10px currentColor'
					},
					'50%': {
						opacity: '0.7',
						transform: 'scale(1.1)',
						boxShadow: '0 0 20px currentColor'
					}
				},
				'gear-rotate': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'engine-start': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.8) rotate(-5deg)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.1) rotate(2deg)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) rotate(0deg)'
					}
				},
				'dashboard-glow': {
					'0%': {
						boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
					},
					'50%': {
						boxShadow: '0 0 50px rgba(59, 130, 246, 0.3)'
					},
					'100%': {
						boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-scale': 'fade-in-scale 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				// Automotive animations
				'odometer-roll': 'odometer-roll 0.8s ease-out',
				'speedometer-sweep': 'speedometer-sweep 1.5s ease-out',
				'fuel-flow': 'fuel-flow 3s ease-in-out infinite',
				'led-pulse': 'led-pulse 2s ease-in-out infinite',
				'gear-rotate': 'gear-rotate 3s linear infinite',
				'engine-start': 'engine-start 2s ease-out',
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
				},
				// Automotive-specific utilities
				'.automotive-card': {
					borderRadius: '12px',
					padding: '24px',
					backgroundColor: 'hsl(var(--card))',
					border: '1px solid hsl(var(--border))',
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
					transition: 'all 0.3s ease',
					'&:hover': {
						transform: 'scale(1.02)',
						boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
					}
				},
				'.dashboard-card': {
					borderRadius: '12px',
					padding: '24px',
					background: 'var(--gradient-dashboard)',
					color: 'hsl(var(--dashboard-foreground))',
					boxShadow: 'var(--shadow-dashboard)'
				},
				'.gauge-container': {
					position: 'relative',
					borderRadius: '50%',
					background: 'conic-gradient(from 0deg, hsl(22 163 74) 0deg 120deg, hsl(245 158 11) 120deg 240deg, hsl(220 38 38) 240deg 360deg)',
					boxShadow: 'var(--shadow-gauge)'
				},
				'.odometer-display': {
					fontFamily: 'JetBrains Mono, Courier New, monospace',
					fontWeight: '700',
					letterSpacing: '2px',
					textAlign: 'center',
					background: 'linear-gradient(145deg, hsl(15 23 42), hsl(30 41 59))',
					color: 'hsl(248 250 252)',
					border: '1px solid hsl(249 115 22)',
					borderRadius: '8px',
					padding: '16px',
					boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
					textShadow: '0 0 10px hsl(249 115 22)'
				},
				'.fuel-tank': {
					position: 'relative',
					borderRadius: '8px',
					overflow: 'hidden',
					background: 'linear-gradient(180deg, transparent 0%, hsl(59 130 246) 100%)',
					border: '1px solid hsl(226 232 240)',
					width: '100%',
					height: '120px'
				},
				'.status-led': {
					display: 'inline-block',
					borderRadius: '50%',
					width: '12px',
					height: '12px',
					animation: 'led-pulse 2s ease-in-out infinite'
				}
			}
			addUtilities(newUtilities)
		}
	],
} satisfies Config;
