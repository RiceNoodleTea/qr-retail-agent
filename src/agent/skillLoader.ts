import path from "node:path";
import { promises as fs } from "node:fs";
import { z } from "zod";

export async function loadSkillPrompts(): Promise<Record<string, string>> {
  const skillsDir = path.join(process.cwd(), "src", "agent", "skills");
  const entries = await fs.readdir(skillsDir);
  const md = entries.filter((e) => e.endsWith(".md"));
  const json = entries.filter((e) => e.endsWith(".json"));

  const SkillJson = z.object({
    id: z.string().min(1),
    version: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    prompt: z.string().min(1),
    allowedTools: z.array(z.string()).optional(),
    suggestedFollowUps: z.array(z.string()).optional(),
  });

  const out: Record<string, string> = {};

  // Prefer JSON skills when both JSON and MD exist.
  for (const file of json) {
    const raw = await fs.readFile(path.join(skillsDir, file), "utf8");
    const parsed = SkillJson.safeParse(JSON.parse(raw));
    if (!parsed.success) continue;
    out[parsed.data.id] = parsed.data.prompt;
  }

  for (const file of md) {
    const key = path.basename(file, ".md");
    if (out[key]) continue;
    out[key] = await fs.readFile(path.join(skillsDir, file), "utf8");
  }
  return out;
}

