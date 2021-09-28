import '@fontsource/raleway/400.css';
import '@fontsource/open-sans/700.css';

import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';

import theme from '../theme';

function MyApp({ Component, pageProps }: any) {
	return (
		<ChakraProvider resetCSS theme={theme}>
			<ColorModeProvider
				options={{
					useSystemColorMode: false,
				}}
			>
				<Component {...pageProps} />
			</ColorModeProvider>
		</ChakraProvider>
	);
}

export default MyApp;
