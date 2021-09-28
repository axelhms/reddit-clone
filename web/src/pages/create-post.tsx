import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useIsAuth } from '../../utils/useIsAuth';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';

const CreatePost: React.FC<{}> = ({}) => {
	const router = useRouter();
	useIsAuth();
	const [, createPost] = useCreatePostMutation();

	return (
		<Layout variant="regular">
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values) => {
					const { error } = await createPost({ input: values });

					if (!error) {
						router.push('/');
					}
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
						<Button mt={4} type="submit" isLoading={isSubmitting}>
							Create post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(CreatePost);
