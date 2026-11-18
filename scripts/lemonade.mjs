#!/usr/bin/env node

import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDotEnv } from '../../../tools/lib/env.mjs';
import { getProject, projects } from '../../../tools/lib/config.mjs';
import { createPost, deletePost, listPosts, slugify } from '../../../tools/lib/posts.mjs';
import { attachImage } from '../../../tools/lib/images.mjs';
import { formatComment, getComment, listComments, setCommentStatus } from '../../../tools/lib/comments.mjs';
import { appendLog } from '../../../tools/lib/session.mjs';
import { publishPost } from '../../../tools/lib/publish.mjs';
import { previewPost } from '../../../tools/lib/preview.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(args) {
  const positional = [];
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith('--')) {
      positional.push(argument);
      continue;
    }

    const [rawKey, inlineValue] = argument.slice(2).split('=', 2);
    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
      continue;
    }

    const next = args[index + 1];
    if (!next || next.startsWith('--')) options[rawKey] = true;
    else {
      options[rawKey] = next;
      index += 1;
    }
  }

  return { positional, options };
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

function finish(run) {
  const result = run();
  if (result && typeof result.then === 'function') return result.then((value) => { appendLog(); return value; });
  appendLog();
  return result;
}

function usage() {
  console.log(`Lemonade CLI

Posts:
  npm run lemonade -- post list [--project <project>] [--collection <id>]
  npm run lemonade -- post create <slug> --title "..." --category math
  npm run lemonade -- post image <file> [--name foo] [--slug <slug>] [--collection blog|aletheia] [--width 1200] [--quality 82] [--force]
  npm run lemonade -- post preview <slug> [--collection blog|aletheia]
  npm run lemonade -- post publish <slug> [--collection blog|aletheia] --push [--edited] [--sync] [--dry-run]
  npm run lemonade -- post delete <slug> [--collection blog|aletheia]

Comments:
  npm run lemonade -- comments list [--status pending] [--post <slug>]
  npm run lemonade -- comments show <id>
  npm run lemonade -- comments approve <id>
  npm run lemonade -- comments reject <id>

Projects: lemonade (default), orange-juice (collections: adventure-log, sketches, comp-bio-research).
Use --input <json-file> with post create for other applications.`);
}

function listPostsCli(projectId, options) {
  const project = getProject(projectId);
  const collections = options.collection
    ? project.collections.filter((collection) => collection.id === options.collection)
    : project.collections;
  console.log('STATUS\tDATE\tSLUG\tTITLE\tPATH');
  for (const collection of collections) {
    for (const post of listPosts(projectId, collection.id)) {
      const date = post.rawDate ? String(post.rawDate).replace(/\t/g, ' ') : '';
      console.log(`${post.status}\t${date}\t${post.slug}\t${post.title.replace(/\t/g, ' ')}\t${relative(root, post.path)}`);
    }
  }
}

async function main() {
  loadDotEnv(root);
  const { positional, options } = parseArgs(process.argv.slice(2));
  const [resource, action, value] = positional;
  const projectId = options.project ?? 'lemonade';
  const collection = options.collection ?? 'blog';

  if (!resource || resource === 'help' || resource === '--help') return usage();

  if (resource === 'post' && action === 'list') return listPostsCli(projectId, options);
  if (resource === 'post' && action === 'create') {
    return finish(() => createPost(projectId, collection, value ?? slugify(options.title ?? ''), options, { logger: console.log }));
  }
  if (resource === 'post' && action === 'image') return finish(() => attachImage(projectId, collection, options.slug, value, options, { logger: console.log }));
  if (resource === 'post' && action === 'preview') {
    const { url, child } = previewPost(projectId, collection, value, options, {
      onEvent: (event) => {
        if (event.type === 'ready') console.log(`Preview: ${event.url}`);
        else if (event.type === 'log') process.stdout.write(event.text);
      },
    });
    console.log(url);
    process.on('SIGINT', () => child.kill('SIGINT'));
    return;
  }
  if (resource === 'post' && action === 'publish') {
    return finish(() => publishPost(projectId, collection, value, options, {
      onEvent: (event) => {
        if (event.type === 'step') console.log(event.message);
        else if (event.type === 'log') process.stdout.write(event.text);
      },
    }).then((result) => {
      console.log(`Published ${result.relativePath}`);
      return result;
    }));
  }
  if (resource === 'post' && action === 'delete') return finish(() => deletePost(projectId, collection, value, { logger: console.log }));
  if (resource === 'comments' && action === 'list') {
    const rows = await listComments(options);
    console.log('ID\tSTATUS\tPOST\tNAME\tCREATED\tMESSAGE');
    for (const row of rows) console.log(formatComment(row));
    return;
  }
  if (resource === 'comments' && action === 'show') {
    const row = await getComment(value);
    console.log(`ID: ${row.id}\nStatus: ${row.status}\nPost: ${row.postSlug}\nName: ${row.name}\nCreated: ${row.createdAt}\nParent: ${row.parentId}\n\n${row.message}`);
    return;
  }
  if (resource === 'comments' && action === 'approve') return setCommentStatus(value, 'approved').then(() => console.log(`Comment ${value}: approved`));
  if (resource === 'comments' && action === 'reject') return setCommentStatus(value, 'rejected').then(() => console.log(`Comment ${value}: rejected`));

  usage();
  process.exitCode = 1;
}

main().catch((error) => fail(error.message));
