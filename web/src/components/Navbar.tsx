import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	useColorMode,
} from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../../utils/isServer';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({ pause: isServer() });
	const { colorMode, toggleColorMode } = useColorMode();
	let body = null;

	if (fetching) {
		body = null;
	} else if (!data?.me) {
		body = (
			<>
				<Button>
					<NextLink href="/login">
						<Link>Login</Link>
					</NextLink>
				</Button>
				<Button ml={4}>
					<NextLink href="/register">
						<Link>Register</Link>
					</NextLink>
				</Button>
			</>
		);
	} else {
		body = (
			<Flex>
				<Box m={'auto'}>{data.me.username}</Box>
				<Button
					onClick={() => {
						logout();
					}}
					isLoading={logoutFetching}
					ml={4}
				>
					Logout
				</Button>
			</Flex>
		);
	}

	return (
		<Flex
			zIndex={1}
			position="sticky"
			top={0}
			p={4}
			borderBottom="2px"
			justify="center"
			bgColor={colorMode === 'light' ? 'white' : '#1A202C'}
			color={colorMode === 'light' ? '#1A202C' : 'white'}
		>
			<NextLink href="/">
				<Link ml={2} style={{ textDecoration: 'none' }}>
					<Heading>Red Hit</Heading>
				</Link>
			</NextLink>

			<Box ml={'auto'}>{body}</Box>
			<Button onClick={() => toggleColorMode()} ml={4}>
				{colorMode === 'light' ? <SunIcon /> : <MoonIcon />}
			</Button>
		</Flex>
	);
};

export default Navbar;
