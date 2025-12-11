import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getShareById } from "$lib/server/db";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { stat } from "fs/promises";
import { lookup } from "mime-types";

dotenv.config();
// Thirdweb imports
let settlePayment: any;
let facilitator: any;
let createThirdwebClient: any;
let avalancheFuji: any;
let USDC_FUJI_ADDRESS: string;

const hasThirdwebCredentials =
  process.env.THIRDWEB_SECRET_KEY &&
  process.env.THIRDWEB_SECRET_KEY !== "placeholder_secret_key_for_development";

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

  const share = await getShareById(contentId);

  if (!share || share.contentType !== "file") {
    return json({ error: "Content not found or not a file" }, { status: 404 });
  }

  // Free file download
  if (!share.price || share.price === 0) {
    const filePath = `static${share.content}`;
    try {
      const fileBuffer = await readFile(filePath);
      const mimeType = lookup(filePath) || "application/octet-stream";
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${share.fileName}"`,
        },
      });
    } catch (e) {
      return json({ error: "File not found on server" }, { status: 404 });
    }
  }

  if (!hasThirdwebCredentials) {
    return json(
      { error: "Payment required" },
      { status: 402, headers: { "WWW-Authenticate": "x402-payment-required" } },
    );
  }
  let result: any;
  try {
    result = await settlePayment({
      resourceUrl: `http://localhost:5173/api/download/${contentId}`,
      method: "GET",
      paymentData,
      payTo: share.walletAddress,
      network: avalancheFuji,
      price: {
        amount: String(share.price * 1000000),
        asset: { address: USDC_FUJI_ADDRESS, decimals: 6 },
      },
      facilitator: thirdwebFacilitator,
    });
  } catch (e) {
    console.log(e);
    return json({ error: "File not found on server" }, { status: 404 });
  }

  if (result.status === 200) {
    const filePath = `static${share.content}`;
    try {
      const fileBuffer = await readFile(filePath);
      const mimeType = lookup(filePath) || "application/octet-stream";
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${share.fileName}"`,
        },
      });
    } catch (e) {
      return json({ error: "File not found on server" }, { status: 404 });
    }
  } else {
    return json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
};
