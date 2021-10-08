import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { createUrqlClient } from '../../utils/createUrqlClient';
import Layout from '../components/Layout';
import {
	useDeletePostMutation,
	useMeQuery,
	usePostsQuery,
} from '../generated/graphql';
import NextLink from 'next/link';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useColorMode } from '@chakra-ui/react';
import UpvoteSection from '../components/UpvoteSection';
import { isServer } from '../../utils/isServer';

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});

	const [{ data, fetching }] = usePostsQuery({
		variables: {
			limit: 15,
		},
	});

	const [meData, meFetching] = useMeQuery({ pause: isServer() });
	const [, deletePost] = useDeletePostMutation();

	const { colorMode } = useColorMode();

	if (!fetching && !data) {
		return <div>Query failed.</div>;
	}

	return (
		<Layout>
			<Flex align="center">
				<NextLink href="create-post">
					<Button
						ml="auto"
						color="white"
						bgColor={colorMode === 'light' ? 'blue' : 'lightBlue'}
						_hover={{
							bgColor:
								colorMode === 'light' ? 'lightBlue' : 'blue',
						}}
					>
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
					{data!.posts.posts.map((post) =>
						!post ? null : (
							<Flex
								key={post.id}
								p={5}
								borderRadius="xl"
								shadow={colorMode === 'light' ? 'md' : 'none'}
								bgColor={
									colorMode === 'light' ? 'white' : 'darkItem'
								}
								transitionDuration="0.3s"
								_hover={{
									transform: 'translate(0, -5px);',
								}}
							>
								<UpvoteSection post={post} />
								<Box w="100%">
									<NextLink
										href="/post/[id]"
										as={`/post/${post.id}`}
									>
										<Link
											style={{ textDecoration: 'none' }}
										>
											<Heading fontSize="xl">
												{post.title}
											</Heading>
											<Text>
												posted by{' '}
												{post.creator.username}
											</Text>
											<Text mt={4}>
												{post.textSnippet}
											</Text>
										</Link>
									</NextLink>
									{meData.data?.me?.username ===
									post.creator.username ? (
										<Flex justifyContent="end">
											<Button
												onClick={() => {
													deletePost({ id: post.id });
												}}
											>
												<DeleteIcon />
											</Button>
										</Flex>
									) : null}
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}

			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[
									data.posts.posts.length - 1
								].createdAt,
							});
						}}
						color={colorMode === 'light' ? 'blue' : 'lightBlue'}
						border="2px"
						borderColor={
							colorMode === 'light' ? 'blue' : 'lightBlue'
						}
						bgColor={colorMode === 'light' ? 'white' : 'dark'}
						_hover={{
							bgColor:
								colorMode === 'light' ? 'grey' : 'darkItem',
						}}
						isLoading={fetching}
						m="auto"
						my={4}
					>
						Load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
