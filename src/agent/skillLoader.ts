import path from "node:path";
import { promises as fs } from "node:fs";

export async function loadSkillPrompts(): Promise<Record<string, string>> {
  const skillsDir = path.join(process.cwd(), "src", "agent", "skills");
  const entries = await fs.readdir(skillsDir);
  const md = entries.filter((e) => e.endsWith(".md"));

  const out: Record<string, string> = {};
  for (const file of md) {
    const key = path.basename(file, ".md");
    out[key] = await fs.readFile(path.join(skillsDir, file), "utf8");
  }
  return out;
}

