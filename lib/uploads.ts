import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveUploadedFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFileName(file.name || "proof.txt");
  const finalName = `${Date.now()}-${randomUUID()}-${safeName}`;

  try {
    await mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });
    const absolutePath = path.join(PUBLIC_UPLOAD_DIR, finalName);
    await writeFile(absolutePath, buffer);
    return `/uploads/${finalName}`;
  } catch {
    const mime = file.type || "application/octet-stream";
    const base64 = buffer.toString("base64");
    return `data:${mime};base64,${base64}`;
  }
}
