import { Button } from '@chakra-ui/button';
import { AddIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import { useColorMode } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { createUrqlClient } from '../../utils/createUrqlClient';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import Layout from '../components/Layout';
import UpvoteSection from '../components/UpvoteSection';
import { usePostsQuery } from '../generated/graphql';

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

	const { colorMode } = useColorMode();

	if (!fetching && !data) {
		return <Box>Query failed.</Box>;
	}

	return (
		<Layout>
			<Flex align="center">
				<NextLink href="create-post">
					<Button
						ml="auto"
						variant={
							colorMode === 'light'
								? 'lightPrimaryButton'
								: 'darkPrimaryButton'
						}
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
									<EditDeletePostButtons
										id={post.id}
										creatorId={post.creator.id}
									/>
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
						isLoading={fetching}
						m="auto"
						my={4}
						variant={
							colorMode === 'light'
								? 'lightSecondaryButton'
								: 'darkSecondaryButton'
						}
					>
						Load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
