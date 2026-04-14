import path from "node:path";
import { promises as fs } from "node:fs";

function dataPath(...parts: string[]) {
  return path.join(process.cwd(), "data", ...parts);
}

export async function readJsonFile<T>(relativePath: string): Promise<T> {
  const p = dataPath(relativePath);
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as T;
}

export async function ensureDir(relativePath: string) {
  const p = dataPath(relativePath);
  await fs.mkdir(p, { recursive: true });
}

export async function appendJsonl(relativePath: string, obj: unknown) {
  const p = dataPath(relativePath);
  const line = `${JSON.stringify(obj)}\n`;
  await fs.appendFile(p, line, "utf8");
}

export async function readJsonl<T>(relativePath: string): Promise<T[]> {
  const p = dataPath(relativePath);
  try {
    const raw = await fs.readFile(p, "utf8");
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l) as T);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

