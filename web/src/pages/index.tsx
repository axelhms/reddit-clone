import { withUrqlClient } from 'next-urql';
import React from 'react';
import { createUrqlClient } from '../../utils/createUrqlClient';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import NextLink from 'next/link';
import { Link } from '@chakra-ui/layout';

const Index = () => {
	const [{ data }] = usePostsQuery();

	return (
		<Layout>
			<NextLink href="create-post">
				<Link>Create post</Link>
			</NextLink>

			{!data ? (
				<div>Loading...</div>
			) : (
				data.posts.map((post) => {
					return <div key={post.id}>{post.title}</div>;
				})
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
