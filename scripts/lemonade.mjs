#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@libsql/client';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = resolve(root, 'node_modules/astro/bin/astro.mjs');
const blogDir = resolve(root, 'src/content/blog');
const notesDir = resolve(root, 'src/content/aletheia');

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
  npm run lemonade -- post image <file> [--name foo] [--slug <slug>] [--collection blog|aletheia] [--width 1200] [--quality 82] [--force]
  npm run lemonade -- post preview <slug>
  npm run lemonade -- post publish <slug> --push [--edited]

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

function toLocalPostDate(date = new Date()) {
  const month = date.toLocaleString('en-US', { month: 'long' });
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}

function setFrontmatterField(filePath, field, value) {
  const content = readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`No frontmatter found in ${filePath}`);
  const lines = match[1].split(/\r?\n/);
  const lineIndex = lines.findIndex((line) => new RegExp(`^${field}:`).test(line));
  const newLine = `${field}: ${quoteYaml(value)}`;
  if (lineIndex >= 0) {
    lines[lineIndex] = newLine;
  } else {
    const dateIndex = lines.findIndex((line) => /^date:/.test(line));
    lines.splice(dateIndex >= 0 ? dateIndex + 1 : lines.length, 0, newLine);
  }
  writeFileSync(filePath, content.replace(match[0], `---\n${lines.join('\n')}\n---`), 'utf8');
}

function findPostInDir(dir, slug) {
  validateSlug(slug);
  for (const extension of ['mdx', 'md']) {
    const path = resolve(dir, `${slug}.${extension}`);
    if (existsSync(path)) return path;
  }
  return null;
}

async function processImage(sourcePath, options) {
  const source = resolve(root, sourcePath);
  if (!existsSync(source)) throw new Error(`Image not found: ${source}`);
  if (options.collection && !['blog', 'aletheia'].includes(options.collection)) {
    throw new Error(`Unknown collection: ${options.collection}`);
  }

  const maxWidth = Math.min(Math.max(Number(options.width ?? 1200) || 1200, 1), 10000);
  const quality = Math.min(Math.max(Number(options.quality ?? 82) || 82, 1), 100);
  const defaultName = basename(source).replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const name = slugify(options.name ?? defaultName) || 'image';
  const outPath = resolve(root, 'public/img/pics', `${name}.webp`);
  if (existsSync(outPath) && !options.force) {
    throw new Error(`Already exists: ${relative(root, outPath)} (use --force to overwrite)`);
  }

  const meta = await sharp(source).metadata();
  const scale = Math.min(1, maxWidth / Math.max(meta.width, meta.height));
  await sharp(source)
    .rotate()
    .resize({
      width: Math.round(meta.width * scale),
      height: Math.round(meta.height * scale),
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toFile(outPath);
  console.log(`Wrote ${relative(root, outPath)}`);

  const webpUrl = `/img/pics/${name}.webp`;
  if (options.slug) {
    const collection = options.collection === 'aletheia' ? 'aletheia' : 'blog';
    const postPath = findPostInDir(collection === 'aletheia' ? notesDir : blogDir, options.slug);
    if (!postPath) throw new Error(`Post not found: ${options.slug} in src/content/${collection}`);
    setFrontmatterField(postPath, 'image', webpUrl);
    console.log(`Set image: ${webpUrl} on ${relative(root, postPath)}`);
  } else {
    console.log(`URL: ${webpUrl}`);
  }
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
    `date: ${quoteYaml(input.date ?? toLocalPostDate())}`,
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

function hasGitHistory(filePath) {
  const result = spawnSync('git', ['log', '--oneline', '-1', '--', filePath], {
    cwd: root,
    encoding: 'utf8',
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}

function getFrontmatterField(filePath, field) {
  const content = readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const line = match[1].split(/\r?\n/).find((line) => new RegExp(`^${field}:`).test(line));
  if (!line) return null;
  return line.slice(line.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '');
}

function publishPost(slug, options) {
  const path = getPostPath(slug);
  if (!existsSync(path)) throw new Error(`Post does not exist: ${slug}`);
  const relativePath = relative(root, path);
  const message = options.message ?? `Publish post: ${slug}`;

  const isFirstPublish = !hasGitHistory(relativePath);
  if (isFirstPublish) {
    const date = toLocalPostDate();
    setFrontmatterField(path, 'date', date);
    console.log(`First publish: setting date to ${date}`);
  } else if (options.edited) {
    const date = toLocalPostDate();
    setFrontmatterField(path, 'updated', date);
    console.log(`Marking as edited on ${date}`);
  }

  const paths = [relativePath];
  const imageUrl = getFrontmatterField(path, 'image');
  if (imageUrl && imageUrl.startsWith('/')) {
    const imageFile = resolve(root, `public${imageUrl}`);
    if (existsSync(imageFile)) {
      paths.push(relative(root, imageFile));
      console.log(`Including image ${paths[paths.length - 1]}`);
    }
  }

  run(process.execPath, [astroBin, 'check']);
  for (const filePath of paths) run('git', ['add', '--', filePath]);
  const stagedCheck = spawnSync('git', ['diff', '--cached', '--quiet', '--exit-code', '--', relativePath], {
    cwd: root,
    stdio: 'ignore',
  });
  if (stagedCheck.status === 0) throw new Error(`No changes to publish for ${relativePath}.`);
  if (stagedCheck.status !== 1) throw new Error('Unable to inspect staged post changes.');
  run('git', ['commit', '-m', message, '--', ...paths]);
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
  if (resource === 'post' && action === 'image') return processImage(value, options);
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
