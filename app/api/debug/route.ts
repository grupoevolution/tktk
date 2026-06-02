import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const DATA_DIR = process.env.DATA_DIR ||
    (process.env.NODE_ENV === "production" ? "/app/data" : path.join(process.cwd(), "data"));

  const result: Record<string, unknown> = {
    DATA_DIR,
    cwd: process.cwd(),
    NODE_ENV: process.env.NODE_ENV,
  };

  // 1. Existe?
  result.dirExists = fs.existsSync(DATA_DIR);

  // 2. Cria se não existir
  if (!result.dirExists) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); result.mkdirOk = true; }
    catch (e: any) { result.mkdirError = e?.message; }
  }

  // 3. Tenta escrever um arquivo que NÃO apaga (persiste entre requests)
  try {
    fs.writeFileSync(path.join(DATA_DIR, "debug_test.txt"), new Date().toISOString());
    result.writeOk = true;
  } catch (e: any) {
    result.writeError = e?.message;
  }

  // 4. Lista arquivos
  try {
    result.files = fs.readdirSync(DATA_DIR);
  } catch (e: any) {
    result.readDirError = e?.message;
  }

  // 5. Conteúdo do videos.json
  try {
    const p = path.join(DATA_DIR, "videos.json");
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
      result.videoCount = Array.isArray(parsed) ? parsed.length : "não é array";
    } else {
      result.videoCount = "arquivo não existe";
    }
  } catch (e: any) {
    result.videosError = e?.message;
  }

  // 6. Testa escrita do videos.json diretamente
  try {
    const testData = [{ id: "test", test: true, ts: Date.now() }];
    fs.writeFileSync(path.join(DATA_DIR, "videos.json"), JSON.stringify(testData));
    const readBack = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "videos.json"), "utf-8"));
    result.directWriteTest = readBack[0]?.id === "test" ? "OK" : "FALHOU";
  } catch (e: any) {
    result.directWriteError = e?.message;
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
