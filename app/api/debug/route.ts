import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const DATA_DIR = process.env.DATA_DIR ||
    (process.env.NODE_ENV === "production" ? "/app/data" : path.join(process.cwd(), "data"));

  let dirExists = false;
  let dirWritable = false;
  let files: string[] = [];
  let videosContent = null;
  let error = null;

  try {
    dirExists = fs.existsSync(DATA_DIR);

    if (!dirExists) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      dirExists = fs.existsSync(DATA_DIR);
    }

    // testa escrita
    const testFile = path.join(DATA_DIR, ".write_test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    dirWritable = true;

    files = fs.readdirSync(DATA_DIR);

    const videosPath = path.join(DATA_DIR, "videos.json");
    if (fs.existsSync(videosPath)) {
      videosContent = JSON.parse(fs.readFileSync(videosPath, "utf-8"));
    }
  } catch (e: any) {
    error = e?.message || String(e);
  }

  return NextResponse.json({
    DATA_DIR,
    dirExists,
    dirWritable,
    files,
    videoCount: Array.isArray(videosContent) ? videosContent.length : null,
    error,
    cwd: process.cwd(),
    NODE_ENV: process.env.NODE_ENV,
  });
}
