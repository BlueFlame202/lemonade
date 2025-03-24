import { defineDb, defineTable, column } from 'astro:db';

const Comment = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    postSlug: column.text(),
    name: column.text(),
    email: column.text({ default: "" }),
    message: column.text(),
    createdAt: column.date({ default: new Date() }),
    parentId: column.number({ default: -1 }),
  },
});

export default defineDb({
  tables: { Comment },
});