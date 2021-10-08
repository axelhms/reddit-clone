import { Box, Flex } from '@chakra-ui/layout';
import { Button, useColorMode } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { createUrqlClient } from '../../../../utils/createUrqlClient';
import { useGetIntId } from '../../../../utils/useGetIntId';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import {
	usePostQuery,
	useUpdatePostMutation,
} from '../../../generated/graphql';

export const EditPost = ({}) => {
	const router = useRouter();
	const intId = useGetIntId();
	const { colorMode } = useColorMode();
	const [, updatePost] = useUpdatePostMutation();

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
		<Layout variant="regular">
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async (values) => {
					// const { error } = await createPost({ input: values });
					// if (!error) {
					// 	router.push('/');
					// }
					await updatePost({ id: intId, ...values });
					router.push('/');
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="title"
							label="Title"
							placeholder="Title"
						/>
						<Box mt={4}>
							<InputField
								name="text"
								label="Body"
								placeholder="Text..."
								textarea
							/>
						</Box>
						<Flex>
							<Button
								mt={4}
								ml="auto"
								color="white"
								bgColor={
									colorMode === 'light' ? 'blue' : 'lightBlue'
								}
								_hover={{
									bgColor:
										colorMode === 'light'
											? 'lightBlue'
											: 'blue',
								}}
								type="submit"
								isLoading={isSubmitting}
							>
								Update post
							</Button>
						</Flex>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(EditPost);
