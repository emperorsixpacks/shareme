import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { FilebaseStorage } from "$lib/server/filebase";
import type { FilebaseSettings } from "$lib/server/settings";
import { logger } from "$lib/server/logger";
import { env } from "$env/dynamic/private"; // Assuming environment variables are loaded this way

function getExtension(filename: string) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) {
    return "";
  }
  return filename.substring(lastDot);
}

// Initialize Filebase Storage
const filebaseSettings: FilebaseSettings = {
  filebase_access_key: env.FILEBASE_ACCESS_KEY || "",
  filebase_secret_access_key: env.FILEBASE_SECRET_ACCESS_KEY || "",
  filebase_bucket_name: env.FILEBASE_BUCKET_NAME || "",
};

const filebaseStorage = new FilebaseStorage(filebaseSettings);

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return json({ error: "No file provided" }, { status: 400 });
    }

    const fileExtension = getExtension(file.name);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
    const folderPath = "uploads";

    const buffer = Buffer.from(await file.arrayBuffer());

    const [key, uploadError] = await filebaseStorage.uploadBytes(
      buffer,
      uniqueFileName,
      folderPath,
    );

    if (uploadError) {
      logger.error("Filebase upload failed:", uploadError);
      return json({ error: "File upload failed" }, { status: 500 });
    }

    // Construct the URL for the uploaded file on Filebase
    const fileUrl = `https://${filebaseSettings.filebase_bucket_name}.s3.filebase.com/${folderPath}/${key}`;

    return json({ url: fileUrl }, { status: 201 });
  } catch (error) {
    logger.error("File upload error:", error);
    return json({ error: "File upload failed" }, { status: 500 });
  }
};
