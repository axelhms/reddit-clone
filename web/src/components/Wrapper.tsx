import { Box, Flex, useColorMode } from '@chakra-ui/react';
import React from 'react';

export type WrapperVariant = 'small' | 'regular';

interface WrapperProps {
	variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({
	children,
	variant = 'regular',
}) => {
	const { colorMode } = useColorMode();

	return (
		<Flex
			minHeight="91.1vh"
			bgColor={colorMode === 'light' ? 'white' : 'dark'}
			color={colorMode === 'light' ? 'dark' : 'white'}
		>
			<Box
				pt={8}
				mx="auto"
				maxWidth={variant === 'regular' ? '1200px' : '800px'}
				w="100%"
			>
				{children}
			</Box>
		</Flex>
	);
};

export default Wrapper;
