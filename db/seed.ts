import { db, Comment } from 'astro:db';

export default async function () {
  await db.insert(Comment).values([
    {
		postSlug: 'comments-enabled',
		name: 'BlueFlame202',
		email: 'aathreyakadambi@gmail.com',
		message: 'Try it yourself below! 😉',
		createdAt: new Date(),
		parentId: -1,
    },
	{
		postSlug: 'comments-enabled',
		name: 'RedFlame020',
		email: 'theredflame020@gmail.com',
		message: 'You can reply too!!',
		createdAt: new Date(),
		parentId: 1,
	},
  ]);
}