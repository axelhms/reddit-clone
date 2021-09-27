import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { createUrqlClient } from '../../utils/createUrqlClient';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { useState } from 'react';

const ForgotPassword: React.FC<{}> = ({}) => {
	const [complete, setComplete] = useState(false);
	const [, forgotPassword] = useForgotPasswordMutation();

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async (values) => {
					await forgotPassword(values);

					setComplete(true);
				}}
			>
				{({ isSubmitting }) =>
					complete ? (
						<Box color="green">
							The email to reset your password was sent. Please
							check your inbox.
						</Box>
					) : (
						<Form>
							<InputField
								name="email"
								label="Email"
								placeholder="Email"
								type="email"
							/>
							<Button
								mt={4}
								type="submit"
								isLoading={isSubmitting}
								colorScheme="teal"
							>
								Send email
							</Button>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
