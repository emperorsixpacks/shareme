import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getShareById } from "$lib/db";
import dotenv from "dotenv";

dotenv.config();
// Thirdweb imports - only used when real credentials are provided
let settlePayment: any;
let facilitator: any;
let createThirdwebClient: any;
let avalancheFuji: any;
let USDC_FUJI_ADDRESS: string;

// Check if we have real Thirdweb credentials
const hasThirdwebCredentials =
  process.env.THIRDWEB_SECRET_KEY &&
  process.env.THIRDWEB_SECRET_KEY !== "placeholder_secret_key_for_development";

// Only initialize Thirdweb if we have real credentials
let client: any;
let thirdwebFacilitator: any;

if (hasThirdwebCredentials) {
  const thirdwebModule = await import("thirdweb");
  const x402Module = await import("thirdweb/x402");
  const chainsModule = await import("thirdweb/chains");
  const constantsModule = await import("$lib/constants");

  createThirdwebClient = thirdwebModule.createThirdwebClient;
  settlePayment = x402Module.settlePayment;
  facilitator = x402Module.facilitator;
  avalancheFuji = chainsModule.avalancheFuji;
  USDC_FUJI_ADDRESS = constantsModule.USDC_FUJI_ADDRESS;

  client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY || "",
  });

  thirdwebFacilitator = facilitator({
    client,
    serverWalletAddress: process.env.THIRDWEB_SERVER_WALLET_ADDRESS || "",
  });
}

export const GET: RequestHandler = async ({ request, params }) => {
  const contentId = params.id;
  const paymentData = request.headers.get("x-payment");

  // Find the content by ID
  const share = getShareById(contentId);

  if (!share) {
    return json({ error: "Content not found" }, { status: 404 });
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

  // If Thirdweb credentials are not configured, return demo payment required response
  if (!hasThirdwebCredentials) {
    return json(
      {
        error: "Payment required",
        message:
          "This content requires payment. Configure Thirdweb credentials to enable payments.",
        demo: true,
      },
      {
        status: 402,
        headers: {
          "WWW-Authenticate": "x402-payment-required",
        },
      },
    );
  }

  // Handle payment for paid content with real Thirdweb
  const result = await settlePayment({
    resourceUrl: `http://localhost:5173/api/view/${contentId}`,
    method: "GET",
    paymentData,
    payTo: share.walletAddress,
    network: avalancheFuji,
    price: {
      amount: String(share.price * 1000000),
      asset: {
        address: USDC_FUJI_ADDRESS,
        decimals: 6,
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
      message: "Payment successful! Access granted.",
    });
  } else {
    // Return payment error response (402 Payment Required or other error)
    return json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
};
