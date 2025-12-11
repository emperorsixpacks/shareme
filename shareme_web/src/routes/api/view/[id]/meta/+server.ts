import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getShareById } from "$lib/server/db";

export const GET: RequestHandler = async ({ params }) => {
  const contentId = params.id;

  // Find the content by ID
  const share = await getShareById(contentId);

  if (!share) {
    return json({ error: "Content not found" }, { status: 404 });
  }

  // Return all share information except the content
  const { content, ...meta } = share;

  return json(meta);
};
