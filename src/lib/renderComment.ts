import { unified } from 'unified';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Comments get Markdown features without the executable JSX/import surface of MDX.
const commentProcessor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeKatex)
  .use(rehypeStringify);

export async function renderComment(message: string) {
  const result = await commentProcessor.process(message);
  return String(result);
}
