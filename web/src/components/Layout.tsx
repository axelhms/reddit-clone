import { Flex } from '@chakra-ui/layout';
import React from 'react';
import Navbar from './Navbar';
import Wrapper, { WrapperVariant } from './Wrapper';

interface LayoutProps {
	variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
	return (
		<Flex flexDirection="column">
			<Navbar />
			<Wrapper variant={variant}>{children}</Wrapper>
		</Flex>
	);
};

export default Layout;
