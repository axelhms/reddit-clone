import { Box, Flex, Heading, Text } from '@chakra-ui/layout';
import { useColorMode } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetPostFromURL } from '../../../utils/useGetPostFromURL';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import UpvoteSection from '../../components/UpvoteSection';

export const Post = ({}) => {
	const { colorMode } = useColorMode();

	const [{ data, error, fetching }] = useGetPostFromURL();

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
				<Box w="100%">
					<Heading fontSize="xl">{data.post.title}</Heading>
					<Text>posted by {data.post.creator.username}</Text>
					<Text mt={4}>{data.post.text}</Text>
					<EditDeletePostButtons
						id={data.post.id}
						creatorId={data.post.creator.id}
					/>
				</Box>
			</Flex>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
