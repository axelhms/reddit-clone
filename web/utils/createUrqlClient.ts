import {
	dedupExchange,
	Exchange,
	fetchExchange,
	stringifyVariables,
	gql,
} from '@urql/core';
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { pipe, tap } from 'wonka';
import {
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
	VoteMutationVariables,
} from '../src/generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import Router from 'next/router';
import { isServer } from './isServer';

export type MergeMode = 'before' | 'after';

export interface PaginationParams {
	offsetArgument?: string;
	limitArgument?: string;
	mergeMode?: MergeMode;
}

const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;
		const allFields = cache.inspectFields(entityKey);
		const fieldInfos = allFields.filter(
			(info) => info.fieldName === fieldName
		);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		const isItInTheCache = cache.resolve(
			cache.resolve(entityKey, fieldKey) as string,
			'posts'
		);
		info.partial = !isItInTheCache;
		let hasMore = true;
		const results: string[] = [];
		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const data = cache.resolve(key, 'posts') as string[];
			const _hasMore = cache.resolve(key, 'hasMore');
			if (!_hasMore) {
				hasMore = _hasMore as boolean;
			}
			results.push(...data);
		});

		return {
			__typename: 'PaginatedPosts',
			hasMore,
			posts: results,
		};
	};
};

export const errorExchange: Exchange =
	({ forward }) =>
	(ops$) => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				if (error) {
					if (error?.message.includes('Not authenticated')) {
						Router.replace('/login');
					}
				}
			})
		);
	};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = '';
	if (isServer()) {
		cookie = ctx.req.headers.cookie;
	}

	return {
		url: 'http://localhost:4000/graphql',
		fetchOptions: {
			credentials: 'include' as const,
			headers: cookie
				? {
						cookie,
				  }
				: undefined,
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				keys: {
					PaginatedPosts: () => null,
				},
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						login: (_result, _args, cache, _info) => {
							betterUpdateQuery<LoginMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.login.errors) {
										return query;
									} else {
										return {
											me: result.login.user,
										};
									}
								}
							);
						},

						register: (_result, _args, cache, _info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.register.errors) {
										return query;
									} else {
										return {
											me: result.register.user,
										};
									}
								}
							);
						},

						logout: (_result, _args, cache, _info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								() => ({ me: null })
							);
						},

						createPost: (_result, _args, cache, _info) => {
							const allFields = cache.inspectFields('Query');
							const fieldInfos = allFields.filter(
								(info) => info.fieldName === 'posts'
							);

							fieldInfos.forEach((fi) => {
								cache.invalidate(
									'Query',
									'posts',
									fi.arguments || {}
								);
							});
						},

						vote: (_result, args, cache, _info) => {
							const { postId, value } =
								args as VoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId }
							);

							if (data) {
								if (data.voteStatus === args.value) {
									return;
								}

								const newPoints =
									(data.points as number) +
									(!data.voteStatus ? 1 : 2) * value;

								cache.writeFragment(
									gql`
										fragment _ on Post {
											points
											voteStatus
										}
									`,
									{
										id: postId,
										points: newPoints,
										voteStatus: value,
									}
								);
							}
						},
					},
				},
			}),
			ssrExchange,
			errorExchange,
			fetchExchange,
		],
	};
};
