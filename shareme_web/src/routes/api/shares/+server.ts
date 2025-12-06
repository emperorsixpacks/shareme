import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In-memory database
const shares = [];

export const POST: RequestHandler = async ({ request }) => {
    const { content, price, contentType, title } = await request.json();

    const newShare = {
        id: crypto.randomUUID(),
        content,
        price,
        contentType,
        title,
        createdAt: new Date(),
    };

    shares.push(newShare);

    return json(newShare, { status: 201 });
};
