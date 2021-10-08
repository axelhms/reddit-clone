import { Box, Flex, Heading, Text } from '@chakra-ui/layout';
import { useColorMode } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import Layout from '../../components/Layout';
import UpvoteSection from '../../components/UpvoteSection';
import { usePostQuery } from '../../generated/graphql';

export const Post = ({}) => {
	const router = useRouter();
	const { colorMode } = useColorMode();

	const intId =
		typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;

	const [{ data, error, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});

	if (fetching) {
		return (
			<Layout>
				<Box>Loading...</Box>
			</Layout>
		);
	}

	if (fetching) {
		return (
			<Layout>
				<Box>Error... {error?.message}</Box>
			</Layout>
		);
	}

	if (!data?.post) {
		return (
			<Layout>
				<Box>Could not find post.</Box>
			</Layout>
		);
	}

	return (
		<Layout>
			<Flex
				key={data.post.id}
				p={5}
				borderRadius="xl"
				shadow={colorMode === 'light' ? 'md' : 'none'}
				bgColor={colorMode === 'light' ? 'white' : 'darkItem'}
			>
				<UpvoteSection post={data.post} />
				<Box>
					<Heading fontSize="xl">{data.post.title}</Heading>
					<Text>posted by {data.post.creator.username}</Text>
					<Text mt={4}>{data.post.text}</Text>
				</Box>
			</Flex>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
