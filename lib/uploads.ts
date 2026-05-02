import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  homeworkUploadExtensions,
  maxHomeworkUploadSizeBytes
} from "@/lib/file-types";

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

type UploadOptions = {
  allowedExtensions?: readonly string[];
  maxSizeBytes?: number;
};

export async function saveUploadedFile(
  file: File,
  folder: string,
  options: UploadOptions = {}
) {
  const maxSizeBytes = options.maxSizeBytes ?? maxHomeworkUploadSizeBytes;

  if (file.size > maxSizeBytes) {
    throw new UploadValidationError("File is too large. Please upload a file under 10 MB.");
  }

  const extension = path.extname(file.name).toLowerCase();
  const allowedExtensions = options.allowedExtensions ?? homeworkUploadExtensions;

  if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
    throw new UploadValidationError("Unsupported file format. Please upload PDF, Word, or scanned image files.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${crypto.randomUUID()}-${safeName}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return {
    fileName: file.name,
    url: `/uploads/${folder}/${fileName}`
  };
}
