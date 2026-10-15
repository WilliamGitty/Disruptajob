import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Teach Node the two module-resolution conveniences TypeScript gives the application code, so the
 * tests can import app modules exactly as they are written.
 *
 *   1. The "@/" alias from tsconfig `paths`.
 *   2. Extensionless relative imports — `./seed` meaning `./seed.ts`.
 *
 * Node strips TypeScript types natively, which is why these tests need no build step, no bundler
 * and no test framework. It does not read tsconfig, hence this file. Thirty lines is the entire
 * price of keeping the zero-dependency rule the rest of the project follows.
 */

const SRC = path.resolve(import.meta.dirname, "../../src");

/** The forms a TypeScript specifier might actually be on disk. */
function candidatesFor(basePath) {
  if (/\.(ts|tsx|js|mjs|json)$/.test(basePath)) return [basePath];
  return [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];
}

async function tryResolve(basePath, context, nextResolve) {
  for (const candidate of candidatesFor(basePath)) {
    try {
      return await nextResolve(pathToFileURL(candidate).href, context);
    } catch {
      // Try the next shape.
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = await tryResolve(path.join(SRC, specifier.slice(2)), context, nextResolve);
    if (resolved) return resolved;
  }

  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const resolved = await tryResolve(path.resolve(parentDir, specifier), context, nextResolve);
    if (resolved) return resolved;
  }

  return nextResolve(specifier, context);
}
