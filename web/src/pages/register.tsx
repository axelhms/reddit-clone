import React from 'react';
import { Form, Formik } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { Flex, useColorMode } from '@chakra-ui/react';
import Layout from '../components/Layout';

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
	const router = useRouter();
	const [, register] = useRegisterMutation();
	const { colorMode } = useColorMode();

	return (
		<Layout>
			<Wrapper variant="small">
				<Formik
					initialValues={{ username: '', email: '', password: '' }}
					onSubmit={async (values, { setErrors }) => {
						const response = await register({ options: values });

						if (response.data?.register.errors) {
							setErrors(
								toErrorMap(response.data.register.errors)
							);
						} else if (response.data?.register.user) {
							router.push('/');
						}
					}}
				>
					{({ isSubmitting }) => (
						<Form>
							<InputField
								name="username"
								label="Username"
								placeholder="Username"
							/>
							<Box mt={4}>
								<InputField
									name="email"
									label="Email"
									placeholder="Email"
									type="email"
								/>
							</Box>
							<Box mt={4}>
								<InputField
									name="password"
									label="Password"
									placeholder="Password"
									type="password"
								/>
							</Box>
							<Flex>
								<Button
									mt={4}
									ml="auto"
									color="white"
									bgColor={
										colorMode === 'light'
											? 'blue'
											: 'lightBlue'
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
									Register
								</Button>
							</Flex>
						</Form>
					)}
				</Formik>
			</Wrapper>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Register);
