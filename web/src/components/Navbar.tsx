import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../../utils/isServer';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({ pause: isServer() });
	let body = null;

	if (fetching) {
		body = null;
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href="/login">
					<Link color="white" mr={2}>
						Login
					</Link>
				</NextLink>
				<NextLink href="/register">
					<Link color="white" mr={2}>
						Register
					</Link>
				</NextLink>
			</>
		);
	} else {
		body = (
			<Flex>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					onClick={() => {
						logout();
					}}
					isLoading={logoutFetching}
					variant="link"
				>
					Logout
				</Button>
			</Flex>
		);
	}

	return (
		<Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4}>
			<Box ml={'auto'}>{body}</Box>
		</Flex>
	);
};

export default Navbar;
