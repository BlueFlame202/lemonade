import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Comment } from 'astro:db';

import { getSession } from 'auth-astro/server';

export const server = {
  addComment: defineAction({
    accept: 'form',
    input: z.object({
      message: z.string().min(1, 'Comment cannot be empty'),
      parentId: z.number().optional(),
    }),
    handler: async ({ message, parentId }, Astro) => {
        let theName: string = "Sans Nom"
        let theEmail: string = "anon@aathslemonade.vercel.app"

        const session = await getSession(Astro.request);
        if (session?.user) {
            theName = session.user.name ?? 'Dr. Strange';  // Default to empty string if name is null/undefined
            theEmail = session.user.email ?? 'drstrange@aathslemonade.vercel.app';  // Default to empty string if email is null/undefined
        }

        const theSlug : string = Astro.originPathname.split('/').pop() ?? 'nowhere-1209513094123';

        const comment = await db
            .insert(Comment)
            .values({
            postSlug: theSlug,
            name: theName,
            email: theEmail,
            message,
            createdAt: new Date(),
            parentId
            })
            .returning();

      return comment[0];
    },
  }),
};