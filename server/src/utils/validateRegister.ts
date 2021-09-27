import { UsernamePasswordInput } from 'src/resolvers/UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
	if (options.username.length <= 2) {
		return [
			{
				field: 'username',
				message: 'Username length needs to be at least two characters',
			},
		];
	}

	if (options.username.includes('@')) {
		return [
			{
				field: 'username',
				message: 'Username must not include an @ sign',
			},
		];
	}

	if (!options.email.includes('@')) {
		return [
			{
				field: 'email',
				message: 'Invalid email',
			},
		];
	}

	if (options.password.length <= 6) {
		return [
			{
				field: 'password',
				message: 'Password length needs to be at least six characters',
			},
		];
	}

	return null;
};
