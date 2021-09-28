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
			height="100%"
			bgColor={colorMode === 'light' ? 'white' : '#1A202C'}
			color={colorMode === 'light' ? '#1A202C' : 'white'}
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
