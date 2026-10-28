// Dev-only URL switches (?admin, ?zone=...) work only on a local dev server: never in a production
// build, and never on a deployed host even if a dev build were uploaded by mistake.
const onLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.hostname.endsWith('.localhost');

export const DEV_TOOLS = import.meta.env.DEV && onLocalhost;

/** A dev switch from the URL (for example `?zone=aquarium`), or null when dev tools are off. */
export function devParam(name: string): string | null {
  return DEV_TOOLS ? new URLSearchParams(location.search).get(name) : null;
}

export const devFlag = (name: string): boolean => DEV_TOOLS && new URLSearchParams(location.search).has(name);
