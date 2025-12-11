import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { writeFile } from "fs/promises";

function getExtension(filename: string) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) {
    return "";
  }
  return filename.substring(lastDot);
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return json({ error: "No file provided" }, { status: 400 });
    }

    const fileExtension = getExtension(file.name);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
    const uploadPath = `static/uploads/${uniqueFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(uploadPath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    return json({ url: fileUrl }, { status: 201 });
  } catch (error) {
    console.error("File upload error:", error);
    return json({ error: "File upload failed" }, { status: 500 });
  }
};
