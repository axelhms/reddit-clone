import { usePostQuery } from '../src/generated/graphql';
import { useGetIntId } from './useGetIntId';

export const useGetPostFromURL = () => {
	const intId = useGetIntId();

	return usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});
};
