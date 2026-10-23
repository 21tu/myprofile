// ADR-004 / FR-005: report each placeholder item without changing the content.
export function findPlaceholders(content: unknown): string[] {
  const paths: string[] = [];

  function visit(value: unknown, path: string): void {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
    } else if (typeof value === 'object' && value !== null) {
      if ('status' in value && value.status === 'placeholder') {
        paths.push(path || '$');
      }
      for (const [key, item] of Object.entries(value)) {
        visit(item, path ? `${path}.${key}` : key);
      }
    }
  }

  visit(content, '');
  return paths;
}
