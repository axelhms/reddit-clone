import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from 'type-graphql';
import * as argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';

@ObjectType()
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => User, { nullable: true })
	user?: User;

	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		if (!req.session.userId) {
			return null;
		}

		return User.findOne(req.session.userId);
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);

		if (errors) {
			return { errors };
		}

		const hashedPassword = await argon2.hash(options.password);
		let user;

		try {
			user = (await User.create({
				username: options.username,
				email: options.email,
				password: hashedPassword,
			}).save()) as any;
		} catch (err) {
			if (err.code === '23505') {
				return {
					errors: [
						{
							field: 'usernameOrEmail',
							message: 'Username already exists',
						},
					],
				};
			}
		}

		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('usernameOrEmail') usernameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			usernameOrEmail.includes('@')
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
		);

		if (!user) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: "Username doesn't exist",
					},
				],
			};
		}

		console.log('Hash: ' + user.password, 'Password: ' + password);

		const valid = await argon2.verify(user.password, password);

		if (!valid) {
			return {
				errors: [
					{
						field: 'password',
						message: 'Incorrect password',
					},
				],
			};
		}

		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME);

				if (err) {
					console.log(err);
					resolve(false);
					return;
				}

				resolve(true);
			})
		);
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Ctx() { redis }: MyContext,
		@Arg('email') email: string
	) {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return true;
		}

		const token = v4();

		await redis.set(
			FORGET_PASSWORD_PREFIX + token,
			user.id,
			'ex',
			1000 * 60 * 60 * 24 * 3
		);

		await sendEmail(
			email,
			`<a href="http://localhost:3000/change-password/${token}">Reset password`
		);

		return true;
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Ctx() { req, redis }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 6) {
			return {
				errors: [
					{
						field: 'newPassword',
						message:
							'Password length needs to be at least six characters',
					},
				],
			};
		}

		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await redis.get(key);

		if (!userId) {
			return {
				errors: [
					{
						field: 'token',
						message: 'Token is expired',
					},
				],
			};
		}

		const userIdNum = parseInt(userId);
		const user = await User.findOne(userIdNum);

		if (!user) {
			return {
				errors: [
					{
						field: 'token',
						message: 'User no longer exists',
					},
				],
			};
		}

		await User.update(
			{ id: userIdNum },
			{
				password: await argon2.hash(newPassword),
			}
		);

		await redis.del(key);

		req.session.userId = user.id;

		return { user };
	}

	/*
	@Query(() => [User])
	users(@Ctx() { em }: MyContext): Promise<User[]> {
		return em.find(User, {});
	}

	@Query(() => User, { nullable: true })
	user(
		@Arg('id') id: number,
		@Ctx() { em }: MyContext
	): Promise<User | null> {
		return em.findOne(User, { id });
	}

	@Mutation(() => User)
	async createUser(
		@Arg('username') username: string,
		@Arg('password') password: string,
		@Ctx() { em }: MyContext
	): Promise<User> {
		const user = em.create(User, { username, password });
		await em.persistAndFlush(user);
		return user;
	}

	@Mutation(() => User)
	async updateUser(
		@Arg('id') id: number,
		@Arg('username', () => String, { nullable: true }) username: string,
		@Ctx() { em }: MyContext
	): Promise<User | null> {
		const user = await em.findOne(User, { id });

		if (!user) {
			return null;
		}

		user.username = username;

		await em.persistAndFlush(user);
		return user;
	}

	@Mutation(() => Boolean)
	async deleteUser(
		@Arg('id') id: number,
		@Ctx() { em }: MyContext
	): Promise<boolean> {
		await em.nativeDelete(User, { id });
		return true;
	}
	*/
}
