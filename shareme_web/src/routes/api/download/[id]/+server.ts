import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getShareById } from "$lib/server/db";
import dotenv from "dotenv";
import { lookup } from "mime-types";
import { FilebaseStorage } from "$lib/server/filebase";
import type { FilebaseSettings } from "$lib/server/settings";
import { logger } from "$lib/server/logger";
import { env } from "$env/dynamic/private";

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

// Initialize Filebase Storage
const filebaseSettings: FilebaseSettings = {
  filebase_access_key: env.FILEBASE_ACCESS_KEY || "",
  filebase_secret_access_key: env.FILEBASE_SECRET_ACCESS_KEY || "",
  filebase_bucket_name: env.FILEBASE_BUCKET_NAME || "",
};

const filebaseStorage = new FilebaseStorage(filebaseSettings);

// Helper to parse Filebase URL to get objectName and folderPath
function parseFilebaseUrl(
  url: string,
): { objectName: string; folderPath: string } | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname
      .split("/")
      .filter((segment) => segment !== "");
    if (pathSegments.length >= 2) {
      const folderPath = pathSegments[pathSegments.length - 2];
      const objectName = pathSegments[pathSegments.length - 1];
      return { objectName, folderPath };
    }
  } catch (e) {
    logger.error("Failed to parse Filebase URL:", e);
  }
  return null;
}

async function downloadFileFromStorage(
  share: any,
): Promise<[Buffer | null, Error | null]> {
  const parsedUrl = parseFilebaseUrl(share.content);
  if (!parsedUrl) {
    return [null, new Error("Invalid Filebase URL in share.content")];
  }
  return filebaseStorage.downloadFromBucket(
    parsedUrl.objectName,
    parsedUrl.folderPath,
  );
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
    const [fileBuffer, downloadError] = await downloadFileFromStorage(share);
    if (downloadError) {
      logger.error("Free file download failed:", downloadError);
      return json({ error: "File not found on server" }, { status: 404 });
    }
    const mimeType = lookup(share.fileName) || "application/octet-stream";
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${share.fileName}"`,
      },
    });
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
    return json({ error: "Payment settlement failed" }, { status: 404 }); // Changed error message
  }

  if (result.status === 200) {
    const [fileBuffer, downloadError] = await downloadFileFromStorage(share);
    if (downloadError) {
      logger.error("Paid file download failed:", downloadError);
      return json({ error: "File not found on server" }, { status: 404 });
    }
    const mimeType = lookup(share.fileName) || "application/octet-stream";
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${share.fileName}"`,
      },
    });
  } else {
    return json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
};
