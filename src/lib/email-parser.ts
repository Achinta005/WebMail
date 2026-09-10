import sanitizeHtml from 'sanitize-html';

export function sanitizeEmailHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'style',
      'h1',
      'h2',
      'u',
      'span',
      'div',
      'hr',
      'font',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class', 'align', 'valign', 'bgcolor', 'color', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data', 'cid'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  });
}
