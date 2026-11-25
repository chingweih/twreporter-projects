export function textReplace(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replace(/\{\{([^{}]+)\}\}/g, (placeholder, key: string) =>
    Object.hasOwn(values, key) ? values[key] : placeholder,
  )
}
