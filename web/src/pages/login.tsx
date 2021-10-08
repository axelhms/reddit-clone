import React from 'react';
import { Form, Formik } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { Box, Flex, Link } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { toErrorMap } from '../../utils/toErrorMap';
import { useRouter } from 'next/router';
import { useLoginMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link';
import { useColorMode } from '@chakra-ui/react';
import Layout from '../components/Layout';

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
	const router = useRouter();
	const [, login] = useLoginMutation();
	const { colorMode } = useColorMode();

	return (
		<Layout>
			<Wrapper variant="small">
				<Formik
					initialValues={{ usernameOrEmail: '', password: '' }}
					onSubmit={async (values, { setErrors }) => {
						const response = await login(values);

						if (response.data?.login.errors) {
							setErrors(toErrorMap(response.data.login.errors));
						} else if (response.data?.login.user) {
							if (typeof router.query.next === 'string') {
								router.push(router.query.next || '/');
							} else {
								router.push('/');
							}
						}
					}}
				>
					{({ isSubmitting }) => (
						<Form>
							<InputField
								name="usernameOrEmail"
								label="Username or Email"
								placeholder="Username or Email"
							/>
							<Box mt={4}>
								<InputField
									name="password"
									label="Password"
									placeholder="Password"
									type="password"
								/>
							</Box>
							<Flex>
								<NextLink href="/forgot-password">
									<Link ml="auto" mt={2}>
										Forgot your password ?
									</Link>
								</NextLink>
							</Flex>
							<Flex>
								<Button
									mt={4}
									ml="auto"
									type="submit"
									isLoading={isSubmitting}
									variant={
										colorMode === 'light'
											? 'lightPrimaryButton'
											: 'darkPrimaryButton'
									}
								>
									Login
								</Button>
							</Flex>
						</Form>
					)}
				</Formik>
			</Wrapper>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
