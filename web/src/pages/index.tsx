import { withUrqlClient } from 'next-urql';
import React from 'react';
import { createUrqlClient } from '../../utils/createUrqlClient';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import NextLink from 'next/link';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { AddIcon } from '@chakra-ui/icons';
import { useColorMode } from '@chakra-ui/react';

const Index = () => {
	const [{ data, fetching }] = usePostsQuery({
		variables: {
			limit: 10,
		},
	});
	const { colorMode } = useColorMode();

	if (!fetching && !data) {
		return <div>Query failed.</div>;
	}

	return (
		<Layout>
			<Flex align="center">
				<Heading>Red Hit</Heading>
				<NextLink href="create-post">
					<Button ml="auto">
						<AddIcon />
						<Link ml={2} style={{ textDecoration: 'none' }}>
							Create post
						</Link>
					</Button>
				</NextLink>
			</Flex>

			{!data && fetching ? (
				<Box mt={4}>Loading...</Box>
			) : (
				<Stack mt={4} spacing={4}>
					{data!.posts.map((post) => (
						<Box
							key={post.id}
							p={5}
							shadow="md"
							borderWidth="1px"
							borderRadius="xl"
							bgColor={
								colorMode === 'light' ? 'white' : '#2c354a'
							}
						>
							<Heading fontSize="xl">{post.title}</Heading>
							<Text mt={4}>{post.textSnippet}</Text>
						</Box>
					))}
				</Stack>
			)}

			{data ? (
				<Flex>
					<Button isLoading={fetching} m="auto" my={4}>
						Load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
