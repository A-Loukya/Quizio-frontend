/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	darkMode: ["class", "class"],
	theme: {
    	extend: {
    		fontFamily: {
    			sans: [
    				'Roboto',
    				'sans-serif'
    			],
    			Fredoka: [
    				'Fredoka',
    				'sans-serif'
    			],
    			Lato: [
    				'Lato',
    				'serif'
    			],
    			playfair: [
    				'Playfair Display',
    				'serif'
    			]
    		},
			colors:{
				
			},
    		animation: {
    			spotlight: 'spotlight 2s ease .75s 1 forwards',
    			grid: 'grid 15s linear infinite',
				shimmer: "shimmer 2s linear infinite"
    		},
    		keyframes: {
    			spotlight: {
    				'0%': {
    					opacity: 0,
    					transform: 'translate(-72%, -62%) scale(0.5)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'translate(-50%,-40%) scale(1)'
    				}
    			},
    			grid: {
    				'0%': {
    					transform: 'translateY(-50%)'
    				},
    				'100%': {
    					transform: 'translateY(0)'
    				}
    			},
				shimmer: {
					from: {
					  "backgroundPosition": "-200% 0"
					},
					to: {
					  "backgroundPosition": "200% 0"
					}
				  }
    		}
    	}
    },
	plugins: [],
  };
  