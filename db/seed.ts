import { db, Comment } from 'astro:db';

export default async function () {
  await db.insert(Comment).values([
    {
      postSlug: 'comments-enabled',
      name: 'BlueFlame202',
      email: 'aathreyakadambi@gmail.com',
      message: 'Try it yourself below! 😉',
      createdAt: new Date(),
    },
  ]);
}