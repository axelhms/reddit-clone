import { Post } from '../entities/Post';
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Upvote } from '../entities/Upvote';
import { User } from '../entities/User';

@InputType()
class PostInput {
	@Field()
	title: string;

	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];

	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 200);
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Ctx() { req, upvoteLoader }: MyContext
	) {
		if (!req.session.userId) {
			return null;
		}

		const upvote = await upvoteLoader.load({
			postId: post.id,
			userId: post.creatorId,
		});

		return upvote ? upvote.value : null;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		const posts = await getConnection().query(
			`
			SELECT p.*
			FROM post p
			${cursor ? `WHERE p."createdAt" < $2` : ''}
			ORDER BY p."createdAt" DESC
			LIMIT $1
		`,
			replacements
		);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg('input') input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({ ...input, creatorId: req.session.userId }).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg('id', () => Int) id: number,
		@Arg('title') title: string,
		@Arg('text') text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const result = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('id = :id and "creatorId" = :creatorId', {
				id,
				creatorId: req.session.userId,
			})
			.returning('*')
			.execute();

		return result.raw[0];
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg('id', () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		await Post.delete({ id, creatorId: req.session.userId });
		return true;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId', () => Int) postId: number,
		@Arg('value', () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const isUpvote = value !== -1;
		const realValue = isUpvote ? 1 : -1;
		const { userId } = req.session;

		const upvote = await Upvote.findOne({ where: { postId, userId } });

		if (upvote && upvote.value !== realValue) {
			await getConnection().transaction(async (trans) => {
				await trans.query(
					`
					UPDATE upvote
					SET value = $1
					WHERE "postId" = $2 AND "userId" = $3
				`,
					[realValue, postId, userId]
				);

				await trans.query(
					`
					UPDATE post p
					SET points = points + $1
					WHERE p.id = $2;
				`,
					[2 * realValue, postId]
				);
			});
		} else if (!upvote) {
			await getConnection().transaction(async (trans) => {
				await trans.query(
					`
					INSERT INTO upvote("userId", "postId", value)
					VALUES($1, $2, $3);
				`,
					[userId, postId, realValue]
				);

				await trans.query(`
					UPDATE post p
					SET points = points + ${realValue}
					WHERE p.id = ${postId};
				`);
			});
		}

		return true;
	}
}
