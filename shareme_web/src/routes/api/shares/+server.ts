import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  addShare,
  getShareById,
  getAllShares,
  type Share,
  updateShare,
} from "$lib/db";

export const POST: RequestHandler = async ({ request }) => {
  const { content, price, contentType, title, walletAddress } =
    await request.json();

  const newShare: Share = {
    id: crypto.randomUUID(),
    content,
    price,
    contentType,
    title,
    walletAddress,
    createdAt: new Date(),
  };

  addShare(newShare);

  return json(newShare, { status: 201 });
};

export const GET: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get("id");

  if (id) {
    const share = getShareById(id);
    if (!share) {
      return json({ error: "Content not found" }, { status: 404 });
    }
    return json(share);
  }

  return json(getAllShares());
};

export const PUT: RequestHandler = async ({ request }) => {
  const { id, walletAddress } = await request.json();

  if (!id || !walletAddress) {
    return json({ error: "Missing id or walletAddress" }, { status: 400 });
  }

  const share = getShareById(id);

  if (!share) {
    return json({ error: "Content not found" }, { status: 404 });
  }

  const updatedShareData: Partial<Share> = { walletAddress };

  try {
    const updatedShare = updateShare(id, updatedShareData);
    return json(updatedShare);
  } catch (e) {
    return json({ error: "Failed to update share" }, { status: 500 });
  }
};
