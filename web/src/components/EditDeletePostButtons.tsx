import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Flex, Link } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../../utils/isServer';

interface EditDeletePostButtonsProps {
	id: number;
	creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
	id,
	creatorId,
}) => {
	const [{ data }] = useMeQuery({ pause: isServer() });
	const [, deletePost] = useDeletePostMutation();

	if (data?.me?.id !== creatorId) {
		return null;
	}

	return (
		<Flex justifyContent="end">
			<NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
				<Button as={Link}>
					<EditIcon />
				</Button>
			</NextLink>
			<Button
				ml={4}
				onClick={() => {
					deletePost({ id });
				}}
			>
				<DeleteIcon />
			</Button>
		</Flex>
	);
};

export default EditDeletePostButtons;
