import router from 'next/router';

export const useGetIntId = () => {
	const intId =
		typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;

	return intId;
};
