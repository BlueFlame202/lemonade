# Lemonade

My blog and website! I've been working on this for a long time, and have learned many things in the process.

## CLI

Use Node `22.12.0` from `.nvmrc`.

```sh
npm run lemonade -- post create my-new-post --title "My New Post" --description "A short summary" --category math
npm run lemonade -- post preview my-new-post
npm run lemonade -- post publish my-new-post --push
```

Post creation also accepts JSON for automation:

```sh
npm run lemonade -- post create my-new-post --input post.json
```

`post image` converts a photo from any directory into a post cover (WebP, max 1200px) in `public/img/pics/`, and optionally sets it as the post's cover:

```sh
npm run lemonade -- post image ~/Downloads/vacation.jpg --slug my-new-post
npm run lemonade -- post image photo.png --name custom-name --collection aletheia --force
```

Dates are stamped on first push: `post create` writes a local-time placeholder, and `post publish` replaces `date:` with the actual first-push date (local time, matching the `"April 12, 2026"` format). Subsequent edits never change `date`; pass `--edited` to mark a major revision with an "Edited on ..." line:

```sh
npm run lemonade -- post publish my-new-post --push --edited
```

Comment moderation reads Turso directly and does not send email notifications:

```sh
npm run lemonade -- comments list
npm run lemonade -- comments show 123
npm run lemonade -- comments approve 123
npm run lemonade -- comments reject 123
```

The CLI loads local `.env` values. Prefer a separate read/write-capable `ASTRO_DB_CLI_TOKEN` for moderation rather than sharing production credentials with other applications.

## 2026 Vision
- [ ] Make better use of Astro types
- [ ] Create a 3D home page
  - [ ] Create 3D Assets via Blender or Recent Vision Transformer Methods
  - [ ] Render 3D Assets with Three.js
  - [ ] Modify materials, lighting, shadows
  - [ ] Add player movement
  - [ ] Make special objects interactive
- [ ] Begin working on sea
- [ ] Loading screen with funny hints for sea (see https://www.facebook.com/reel/886555103274273?fs=e&mibextid=0NULKw&fs=e&s=TIeQ9V)
- [ ] A better system for feature requests, more use of Github issues
- [ ] A better system for prereleasing blogs and also help localhost show more details for me when drafting and can see unpublished articles
