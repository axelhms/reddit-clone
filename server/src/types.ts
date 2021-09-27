import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
	req: Request;
	res: Response;
	redis: Redis;
};

// Fix merged declaration on req.session
declare module 'express-session' {
	interface Session {
		userId: number;
	}
}
