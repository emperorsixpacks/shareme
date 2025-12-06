import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { settlePayment, facilitator } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';
import { avalancheFuji } from 'thirdweb/chains';
import { USDC_FUJI_ADDRESS } from '$lib/constants';
import { getShareById } from '$lib/db';

const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY || '',
});

const thirdwebFacilitator = facilitator({
    client,
    serverWalletAddress: process.env.THIRDWEB_SERVER_WALLET_ADDRESS || '',
});

export const GET: RequestHandler = async ({ request, params }) => {
    const contentId = params.id;
    const paymentData = request.headers.get('x-payment');

    // Find the content by ID
    const share = getShareById(contentId);

    if (!share) {
        return json({ error: 'Content not found' }, { status: 404 });
    }

    // If no price is set, return content directly (free content)
    if (!share.price || share.price === 0) {
        return json({
            id: share.id,
            title: share.title,
            content: share.content,
            contentType: share.contentType,
            createdAt: share.createdAt,
        });
    }

    // Handle payment for paid content
    const result = await settlePayment({
        resourceUrl: `/api/view/${contentId}`,
        method: 'GET',
        paymentData,
        payTo: share.walletAddress, // Creator's smart wallet address
        network: avalancheFuji,
        price: {
            amount: share.price.toString(),
            asset: {
                address: USDC_FUJI_ADDRESS,
            },
        },
        facilitator: thirdwebFacilitator,
    });

    // If payment is successful, return the content
    if (result.status === 200) {
        return json({
            id: share.id,
            title: share.title,
            content: share.content,
            contentType: share.contentType,
            createdAt: share.createdAt,
            message: 'Payment successful! Access granted.',
        });
    } else {
        // Return payment error response (402 Payment Required or other error)
        return json(result.responseBody, {
            status: result.status,
            headers: result.responseHeaders,
        });
    }
};
