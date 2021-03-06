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
import { useRouter } from 'next/router';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
	const router = useRouter();
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({ pause: isServer() });
	const { colorMode, toggleColorMode } = useColorMode();
	let body = null;

	if (fetching) {
		body = null;
	} else if (!data?.me) {
		body = (
			<>
				<Button
					variant={
						colorMode === 'light'
							? 'lightSecondaryButton'
							: 'darkNavbarSecondaryButton'
					}
				>
					<NextLink href="/login">
						<Link style={{ textDecoration: 'none' }}>Login</Link>
					</NextLink>
				</Button>
				<Button
					ml={4}
					variant={
						colorMode === 'light'
							? 'lightPrimaryButton'
							: 'darkPrimaryButton'
					}
				>
					<NextLink href="/register">
						<Link style={{ textDecoration: 'none' }}>Register</Link>
					</NextLink>
				</Button>
			</>
		);
	} else {
		body = (
			<Flex>
				<Box m={'auto'} fontSize="xl">
					{data.me.username}
				</Box>
				<Button
					onClick={async () => {
						await logout();
						router.reload();
					}}
					isLoading={logoutFetching}
					ml={4}
					variant={
						colorMode === 'light'
							? 'lightSecondaryButton'
							: 'darkNavbarSecondaryButton'
					}
				>
					Logout
				</Button>
			</Flex>
		);
	}

	return (
		<Box zIndex={1} position="sticky" top={0}>
			<Box
				h="8px"
				bgGradient="linear-gradient(135deg, rgb(87, 112, 255) 0px, rgb(255, 117, 179) 60%, rgb(255, 124, 107) 100%)"
			></Box>
			<Flex
				p={4}
				justify="center"
				bgColor={colorMode === 'light' ? 'white' : 'darkItem'}
				color={colorMode === 'light' ? 'dark' : 'white'}
				shadow={colorMode === 'light' ? 'md' : 'none'}
			>
				<NextLink href="/">
					<Link ml={2} style={{ textDecoration: 'none' }}>
						<Heading color="blue">REDHIT</Heading>
					</Link>
				</NextLink>

				<Box ml={'auto'}>{body}</Box>
				<Button onClick={() => toggleColorMode()} ml={4}>
					{colorMode === 'light' ? <SunIcon /> : <MoonIcon />}
				</Button>
			</Flex>
		</Box>
	);
};

export default Navbar;
