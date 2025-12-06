import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addShare, getShareById, getAllShares, type Share } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
    const { content, price, contentType, title, walletAddress } = await request.json();

    const newShare: Share = {
        id: crypto.randomUUID(),
        content,
        price,
        contentType,
        title,
        walletAddress, // Creator's smart wallet address for receiving payments
        createdAt: new Date(),
    };

    addShare(newShare);

    return json(newShare, { status: 201 });
};

export const GET: RequestHandler = async ({ url }) => {
    const id = url.searchParams.get('id');
    
    if (id) {
        const share = getShareById(id);
        if (!share) {
            return json({ error: 'Content not found' }, { status: 404 });
        }
        return json(share);
    }
    
    return json(getAllShares());
};
