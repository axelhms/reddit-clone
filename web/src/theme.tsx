import { extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

// https://chakra-ui.com/docs/theming/customize-theme#customizing-single-components

const colors = {
	white: 'white',
	grey: '#f2f2f2',
	lightDark: '#424b5a',
	dark: '#1A202C',
	darkItem: '#2D3748',
	blue: '#415EFF',
	lightBlue: '#546eff',
};

const primaryButton = {
	color: 'white',
};

const secondaryButton = {
	border: '2px',
};

const components = {
	Button: {
		variants: {
			lightPrimaryButton: {
				...primaryButton,
				bgColor: 'blue',
				_hover: {
					bgColor: 'lightBlue',
				},
			},

			darkPrimaryButton: {
				...primaryButton,
				bgColor: 'lightBlue',
				_hover: {
					bgColor: 'blue',
				},
			},

			lightSecondaryButton: {
				...secondaryButton,
				color: 'blue',
				borderColor: 'blue',
				bgColor: 'white',
				_hover: {
					bgColor: 'grey',
				},
			},

			darkSecondaryButton: {
				...secondaryButton,
				color: 'lightBlue',
				borderColor: 'lightBlue',
				bgColor: 'dark',
				_hover: {
					bgColor: 'darkItem',
				},
			},

			darkNavbarSecondaryButton: {
				...secondaryButton,
				color: 'lightBlue',
				borderColor: 'lightBlue',
				bgColor: 'darkItem',
				_hover: {
					bgColor: 'lightDark',
				},
			},
		},
	},
};

const fonts = {
	heading: 'Open Sans',
	body: 'Raleway',
};

const breakpoints = createBreakpoints({
	sm: '40em',
	md: '52em',
	lg: '64em',
	xl: '80em',
});

const theme = extendTheme({
	colors,
	components,
	fonts,
	breakpoints,
	icons: {
		logo: {
			path: (
				<svg
					width="3000"
					height="3163"
					viewBox="0 0 3000 3163"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect width="3000" height="3162.95" fill="none" />
					<path
						d="M1470.89 1448.81L2170 2488.19H820V706.392H2170L1470.89 1448.81ZM1408.21 1515.37L909.196 2045.3V2393.46H1998.84L1408.21 1515.37Z"
						fill="currentColor"
					/>
				</svg>
			),
			viewBox: '0 0 3000 3163',
		},
	},
});

export default theme;
