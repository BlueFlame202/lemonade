import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { and, db, Comment, eq, gt, isNull, or } from 'astro:db';
import { ActionError } from 'astro:actions';

import { getSession } from 'auth-astro/server';
import { getEntry } from 'astro:content';
import { createHash } from 'node:crypto';

const MAX_SUBMISSIONS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_MESSAGE_LENGTH = 5000;

const defaultSpamKeywords = [
  'buy followers',
  'casino',
  'crypto investment',
  'guest post',
  'seo service',
  'telegram',
  'viagra',
  'whatsapp',
];

function hashRateLimitValue(value: string) {
  const salt = import.meta.env.RATE_LIMIT_SALT ?? import.meta.env.AUTH_SECRET ?? 'development-only-salt';
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function isSpam(message: string) {
  const keywords = (import.meta.env.COMMENT_SPAM_KEYWORDS ?? defaultSpamKeywords.join(','))
    .split(',')
    .map((keyword: string) => keyword.trim().toLocaleLowerCase())
    .filter(Boolean);
  const normalizedMessage = message.normalize('NFKC').toLocaleLowerCase();
  return keywords.some((keyword: string) => normalizedMessage.includes(keyword));
}

export const server = {
  addComment: defineAction({
    accept: 'form',
    input: z.object({
      postSlug: z.string().trim().min(1).max(200),
      message: z.string().trim().min(1, 'Comment cannot be empty').max(MAX_MESSAGE_LENGTH, `Comments must be ${MAX_MESSAGE_LENGTH} characters or fewer`),
      parentId: z.number().int().positive().optional(),
    }),
    handler: async ({ postSlug, message, parentId }, Astro) => {
      const post = await getEntry('blog', postSlug) ?? await getEntry('blog', `${postSlug}/index`);
      if (!post) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'That post does not exist.' });
      }

      if (isSpam(message)) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'This comment was flagged as spam.' });
      }

      const session = await getSession(Astro.request);
      const name = session?.user?.name?.trim() || 'Anonymous';
      const email = session?.user?.email?.trim() || '';
      const ipHash = hashRateLimitValue(getClientIp(Astro.request));
      const actorHash = email ? hashRateLimitValue(email.toLocaleLowerCase()) : '';
      const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
      const rateLimitKeys = [eq(Comment.ipHash, ipHash)];
      if (actorHash) rateLimitKeys.push(eq(Comment.actorHash, actorHash));

      const recentSubmissions = await db
        .select({ id: Comment.id })
        .from(Comment)
        .where(and(gt(Comment.createdAt, cutoff), or(...rateLimitKeys)))
        .limit(MAX_SUBMISSIONS_PER_WINDOW + 1);

      if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_WINDOW) {
        throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'Please wait a minute before commenting again.' });
      }

      if (parentId !== undefined) {
        const parent = await db
          .select({ id: Comment.id, parentId: Comment.parentId })
          .from(Comment)
          .where(and(eq(Comment.id, parentId), eq(Comment.postSlug, postSlug), or(eq(Comment.status, 'approved'), isNull(Comment.status), eq(Comment.status, ''))))
          .limit(1);

        if (!parent.length || (parent[0].parentId !== -1 && parent[0].parentId !== null)) {
          throw new ActionError({ code: 'BAD_REQUEST', message: 'That comment cannot be replied to.' });
        }
      }

      const inserted = await db
        .insert(Comment)
        .values({
          postSlug,
          name,
          email,
          message,
          createdAt: new Date(),
          parentId: parentId ?? -1,
          status: 'pending',
          ipHash,
          actorHash,
        })
        .returning({ id: Comment.id, postSlug: Comment.postSlug, name: Comment.name, message: Comment.message, createdAt: Comment.createdAt, parentId: Comment.parentId, status: Comment.status });

      return inserted[0];
    },
  }),

  moderateComment: defineAction({
    accept: 'form',
    input: z.object({
      commentId: z.number().int().positive(),
      status: z.enum(['approved', 'rejected']),
    }),
    handler: async ({ commentId, status }, Astro) => {
      const session = await getSession(Astro.request);
      const adminEmail = import.meta.env.ADMIN_EMAIL?.trim().toLocaleLowerCase();
      const sessionEmail = session?.user?.email?.trim().toLocaleLowerCase();

      if (!adminEmail || !sessionEmail || sessionEmail !== adminEmail) {
        throw new ActionError({ code: 'FORBIDDEN', message: 'You are not allowed to moderate comments.' });
      }

      await db.update(Comment).set({ status }).where(eq(Comment.id, commentId));
      return { commentId, status };
    },
  }),
};
