export function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce<string>(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
