#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@libsql/client';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = resolve(root, 'node_modules/astro/bin/astro.mjs');
const blogDir = resolve(root, 'src/content/blog');

function loadDotEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

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

function usage() {
  console.log(`Lemonade CLI

Posts:
  npm run lemonade -- post create <slug> --title "..." --category math
  npm run lemonade -- post preview <slug>
  npm run lemonade -- post publish <slug> --push

Comments:
  npm run lemonade -- comments list [--status pending] [--post <slug>]
  npm run lemonade -- comments show <id>
  npm run lemonade -- comments approve <id>
  npm run lemonade -- comments reject <id>

Use --input <json-file> with post create for other applications.`);
}

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function validateSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Slug must contain lowercase letters, numbers, and hyphens only.');
  }
}

function getPostPath(slug) {
  validateSlug(slug);
  for (const extension of ['mdx', 'md']) {
    const path = resolve(blogDir, `${slug}.${extension}`);
    if (existsSync(path)) return path;
  }
  return resolve(blogDir, `${slug}.mdx`);
}

function readJsonInput(inputPath) {
  if (!inputPath) return {};
  const source = inputPath === '-' ? readFileSync(0, 'utf8') : readFileSync(resolve(root, inputPath), 'utf8');
  return JSON.parse(source);
}

function quoteYaml(value) {
  return JSON.stringify(String(value ?? ''));
}

function createPost(slug, options) {
  validateSlug(slug);
  const input = { ...readJsonInput(options.input), ...options };
  const extension = input.format === 'md' ? 'md' : 'mdx';
  const path = resolve(blogDir, `${slug}.${extension}`);

  if (existsSync(path)) throw new Error(`Post already exists: ${relative(root, path)}`);
  if (!input.title || !input.description || !input.category) {
    throw new Error('Post creation requires title, description, and category.');
  }

  const categories = String(input.category).split(',').map((category) => category.trim()).filter(Boolean);
  const frontmatter = [
    '---',
    `title: ${quoteYaml(input.title)}`,
    `description: ${quoteYaml(input.description)}`,
    `date: ${quoteYaml(input.date ?? new Date().toISOString().slice(0, 10))}`,
    `author: ${quoteYaml(input.author ?? 'Aathreya Kadambi')}`,
    `category: [${categories.map(quoteYaml).join(', ')}]`,
    ...(input.image ? [`image: ${quoteYaml(input.image)}`] : []),
    '---',
    '',
    input.body ?? '# New post\n\nStart writing here.',
    '',
  ].join('\n');

  writeFileSync(path, frontmatter, 'utf8');
  console.log(`Created ${relative(root, path)}`);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function previewPost(slug, options) {
  const path = getPostPath(slug);
  if (!existsSync(path)) throw new Error(`Post does not exist: ${slug}`);

  const port = String(options.port ?? 4321);
  console.log(`Preview: http://127.0.0.1:${port}/blog/${slug}`);
  const child = spawn(process.execPath, [astroBin, 'dev', '--host', '127.0.0.1', '--port', port], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  process.on('SIGINT', () => child.kill('SIGINT'));
}

function publishPost(slug, options) {
  const path = getPostPath(slug);
  if (!existsSync(path)) throw new Error(`Post does not exist: ${slug}`);
  const relativePath = relative(root, path);
  const message = options.message ?? `Publish post: ${slug}`;

  run(process.execPath, [astroBin, 'check']);
  run('git', ['add', '--', relativePath]);
  const stagedCheck = spawnSync('git', ['diff', '--cached', '--quiet', '--exit-code', '--', relativePath], {
    cwd: root,
    stdio: 'ignore',
  });
  if (stagedCheck.status === 0) throw new Error(`No changes to publish for ${relativePath}.`);
  if (stagedCheck.status !== 1) throw new Error('Unable to inspect staged post changes.');
  run('git', ['commit', '-m', message, '--', relativePath]);
  if (options.push) run('git', ['push', 'origin', 'HEAD']);
  else console.log('Committed locally. Re-run with --push to publish to the remote repository.');
}

function getDatabase() {
  const url = process.env.ASTRO_DB_REMOTE_URL;
  const authToken = process.env.ASTRO_DB_CLI_TOKEN ?? process.env.ASTRO_DB_APP_TOKEN;
  if (!url || !authToken) throw new Error('Set ASTRO_DB_REMOTE_URL and ASTRO_DB_CLI_TOKEN (or ASTRO_DB_APP_TOKEN).');
  return createClient({ url, authToken });
}

function formatComment(row) {
  const message = String(row.message ?? '').replace(/\s+/g, ' ').trim().slice(0, 180);
  return `${row.id}\t${row.status}\t${row.postSlug}\t${row.name}\t${row.createdAt}\t${message}`;
}

async function listComments(options) {
  const database = getDatabase();
  const clauses = ['status = ?'];
  const values = [String(options.status ?? 'pending')];
  if (options.post) {
    clauses.push('postSlug = ?');
    values.push(String(options.post));
  }

  const limit = Math.min(Math.max(Number(options.limit ?? 50), 1), 200);
  const result = await database.execute({
    sql: `SELECT id, postSlug, name, message, createdAt, status FROM Comment WHERE ${clauses.join(' AND ')} ORDER BY createdAt DESC LIMIT ?`,
    args: [...values, limit],
  });

  console.log('ID\tSTATUS\tPOST\tNAME\tCREATED\tMESSAGE');
  for (const row of result.rows) console.log(formatComment(row));
}

async function showComment(id) {
  const database = getDatabase();
  const result = await database.execute({
    sql: 'SELECT id, postSlug, name, message, createdAt, parentId, status FROM Comment WHERE id = ?',
    args: [Number(id)],
  });
  if (!result.rows.length) throw new Error(`Comment ${id} was not found.`);
  const row = result.rows[0];
  console.log(`ID: ${row.id}\nStatus: ${row.status}\nPost: ${row.postSlug}\nName: ${row.name}\nCreated: ${row.createdAt}\nParent: ${row.parentId}\n\n${row.message}`);
}

async function setCommentStatus(id, status) {
  const database = getDatabase();
  const result = await database.execute({
    sql: 'UPDATE Comment SET status = ? WHERE id = ?',
    args: [status, Number(id)],
  });
  if (result.rowsAffected !== 1) throw new Error(`Comment ${id} was not found.`);
  console.log(`Comment ${id}: ${status}`);
}

async function main() {
  loadDotEnv();
  const { positional, options } = parseArgs(process.argv.slice(2));
  const [resource, action, value] = positional;

  if (!resource || resource === 'help' || resource === '--help') return usage();

  if (resource === 'post' && action === 'create') return createPost(value ?? slugify(options.title ?? ''), options);
  if (resource === 'post' && action === 'preview') return previewPost(value, options);
  if (resource === 'post' && action === 'publish') return publishPost(value, options);
  if (resource === 'comments' && action === 'list') return listComments(options);
  if (resource === 'comments' && action === 'show') return showComment(value);
  if (resource === 'comments' && action === 'approve') return setCommentStatus(value, 'approved');
  if (resource === 'comments' && action === 'reject') return setCommentStatus(value, 'rejected');

  usage();
  process.exitCode = 1;
}

main().catch((error) => fail(error.message));
