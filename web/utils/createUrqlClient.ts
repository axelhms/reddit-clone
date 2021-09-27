import { dedupExchange, Exchange, fetchExchange } from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
import { pipe, tap } from 'wonka';
import {
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
} from '../src/generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import Router from 'next/router';

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

export const createUrqlClient = (ssrExchange: any) => ({
	url: 'http://localhost:4000/graphql',
	fetchOptions: {
		credentials: 'include' as const,
	},
	exchanges: [
		dedupExchange,
		cacheExchange({
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
				},
			},
		}),
		ssrExchange,
		errorExchange,
		fetchExchange,
	],
});
