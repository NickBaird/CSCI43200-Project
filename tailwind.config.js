/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [
		require("tailwind-scrollbar"), // Add this line
		function ({ addBase }) {
			addBase({
				"::-webkit-scrollbar-button": { display: "none" },
			});
		},
	],
};
