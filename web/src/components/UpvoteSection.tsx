import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';
import { Text } from '@chakra-ui/layout';

interface UpvoteSectionProps {
	post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		'upvote-loading' | 'downvote-loading' | 'not-loading'
	>('not-loading');
	const [, vote] = useVoteMutation();

	return (
		<Flex
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
			mr={4}
		>
			<IconButton
				onClick={async () => {
					if (post.voteStatus === 1) {
						return;
					}

					setLoadingState('upvote-loading');
					await vote({ value: 1, postId: post.id });
					setLoadingState('not-loading');
				}}
				colorScheme={post.voteStatus === 1 ? 'green' : undefined}
				isLoading={loadingState === 'upvote-loading'}
				aria-label="Upvote"
				icon={<ChevronUpIcon />}
			/>
			<Text mt={1} mb={1} fontSize="xl">
				{post.points}
			</Text>
			<IconButton
				onClick={async () => {
					if (post.voteStatus === -1) {
						return;
					}

					setLoadingState('downvote-loading');
					await vote({ value: -1, postId: post.id });
					setLoadingState('not-loading');
				}}
				colorScheme={post.voteStatus === -1 ? 'red' : undefined}
				isLoading={loadingState === 'downvote-loading'}
				aria-label="Downvote"
				icon={<ChevronDownIcon />}
			/>
		</Flex>
	);
};

export default UpvoteSection;
