import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOAD_DIR = path.join(process.cwd(), "tmp-uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const fileUpload = multer({
  dest: UPLOAD_DIR,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
});

interface FileScanResult {
  fileName: string;
  fileSize: number;
  mimeType: string;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  };
  entropy: number;
  strings: string[];
  stringsCount: number;
}

const MAGIC_BYTES: Array<{ bytes: number[]; mask?: number[]; offset?: number; mime: string }> = [
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: "image/png" },
  { bytes: [0xff, 0xd8, 0xff], mime: "image/jpeg" },
  { bytes: [0x47, 0x49, 0x46, 0x38], mime: "image/gif" },
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: "application/pdf" },
  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: "application/zip" },
  { bytes: [0x50, 0x4b, 0x05, 0x06], mime: "application/zip" },
  { bytes: [0x50, 0x4b, 0x07, 0x08], mime: "application/zip" },
  { bytes: [0x1f, 0x8b], mime: "application/gzip" },
  { bytes: [0x42, 0x5a, 0x68], mime: "application/x-bzip2" },
  { bytes: [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00], mime: "application/x-xz" },
  { bytes: [0x7f, 0x45, 0x4c, 0x46], mime: "application/x-elf" },
  { bytes: [0x4d, 0x5a], mime: "application/x-dosexec" },
  { bytes: [0xca, 0xfe, 0xba, 0xbe], mime: "application/java-archive" },
  { bytes: [0xce, 0xfa, 0xed, 0xfe], mime: "application/x-mach-binary" },
  { bytes: [0xcf, 0xfa, 0xed, 0xfe], mime: "application/x-mach-binary" },
  { bytes: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07], mime: "application/x-rar-compressed" },
  { bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], mime: "application/x-7z-compressed" },
  { bytes: [0x00, 0x00, 0x00], mime: "video/mp4", offset: 4 },
  { bytes: [0x49, 0x44, 0x33], mime: "audio/mpeg" },
  { bytes: [0xff, 0xfb], mime: "audio/mpeg" },
  { bytes: [0x4f, 0x67, 0x67, 0x53], mime: "audio/ogg" },
  { bytes: [0x52, 0x49, 0x46, 0x46], mime: "audio/wav" },
  { bytes: [0x66, 0x4c, 0x61, 0x43], mime: "audio/flac" },
  { bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], mime: "application/x-ole-storage" },
  { bytes: [0x3c, 0x3f, 0x78, 0x6d, 0x6c], mime: "application/xml" },
  { bytes: [0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45, 0x20, 0x68, 0x74, 0x6d, 0x6c], mime: "text/html" },
  { bytes: [0x3c, 0x68, 0x74, 0x6d, 0x6c], mime: "text/html" },
  { bytes: [0x7b], mime: "application/json" },
  { bytes: [0x23, 0x21], mime: "text/x-shellscript" },
];

function detectMimeType(buffer: Buffer, fileName: string): string {
  for (const sig of MAGIC_BYTES) {
    const offset = sig.offset || 0;
    if (buffer.length < offset + sig.bytes.length) continue;
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      const b = buffer[offset + i];
      const expected = sig.bytes[i];
      const mask = sig.mask ? sig.mask[i] : 0xff;
      if ((b & mask) !== expected) {
        match = false;
        break;
      }
    }
    if (match) return sig.mime;
  }

  const ext = path.extname(fileName).toLowerCase();
  const extMap: Record<string, string> = {
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".js": "application/javascript",
    ".ts": "application/typescript",
    ".py": "text/x-python",
    ".rb": "text/x-ruby",
    ".go": "text/x-go",
    ".rs": "text/x-rust",
    ".c": "text/x-c",
    ".cpp": "text/x-c++",
    ".h": "text/x-c",
    ".java": "text/x-java",
    ".css": "text/css",
    ".md": "text/markdown",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".toml": "text/toml",
    ".ini": "text/ini",
    ".cfg": "text/plain",
    ".log": "text/plain",
    ".sql": "application/sql",
    ".sh": "text/x-shellscript",
    ".bat": "text/x-bat",
    ".ps1": "text/x-powershell",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".tiff": "image/tiff",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  return extMap[ext] || "application/octet-stream";
}

function computeHashes(buffer: Buffer): FileScanResult["hashes"] {
  return {
    md5: crypto.createHash("md5").update(buffer).digest("hex"),
    sha1: crypto.createHash("sha1").update(buffer).digest("hex"),
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
    sha512: crypto.createHash("sha512").update(buffer).digest("hex"),
  };
}

function calculateEntropy(buffer: Buffer): number {
  if (buffer.length === 0) return 0;

  const freq = new Array(256).fill(0);
  for (let i = 0; i < buffer.length; i++) {
    freq[buffer[i]]++;
  }

  let entropy = 0;
  const len = buffer.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] === 0) continue;
    const p = freq[i] / len;
    entropy -= p * Math.log2(p);
  }

  return Math.round(entropy * 10000) / 10000;
}

function extractStrings(buffer: Buffer, minLength: number = 6, maxStrings: number = 500): string[] {
  const results: string[] = [];
  let current = "";

  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte >= 0x20 && byte <= 0x7e) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= minLength) {
        results.push(current);
        if (results.length >= maxStrings) break;
      }
      current = "";
    }
  }

  if (current.length >= minLength && results.length < maxStrings) {
    results.push(current);
  }

  return results;
}

function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("[FileScanner] Failed to clean up file:", filePath, err);
  }
}

export async function scanFile(filePath: string, originalName: string): Promise<FileScanResult> {
  try {
    const buffer = fs.readFileSync(filePath);
    const hashes = computeHashes(buffer);
    const mimeType = detectMimeType(buffer, originalName);
    const entropy = calculateEntropy(buffer);
    const strings = extractStrings(buffer);

    return {
      fileName: originalName,
      fileSize: buffer.length,
      mimeType,
      hashes,
      entropy,
      strings,
      stringsCount: strings.length,
    };
  } finally {
    cleanupFile(filePath);
  }
}
