// Payment utilities for handling x402 payments with Thirdweb
const { wrapFetchWithPayment } = await import("thirdweb/x402");
import { createWallet, smartWallet } from "thirdweb/wallets";
import { avalancheFuji } from "thirdweb/chains";
import { createNormalizedFetch } from "$lib/utils";
// Client-side Thirdweb client (uses clientId instead of secretKey)
export async function createPaymentClient(clientId: string) {
  const { createThirdwebClient } = await import("thirdweb");
  return createThirdwebClient({
    clientId,
  });
}
/**
 * Wraps fetch with payment functionality using Thirdweb's x402 SDK
 * @param client - Thirdweb client instance
 * @param wallet - Connected wallet instance
 * @param url - URL to fetch
 * @returns Response with payment handled
 */
export async function fetchWithPayment(
  client: any,
  url: string,
): Promise<Response> {
  try {
    const wallet = createWallet("io.metamask");
    await wallet.connect({ client });

    const normalizedFetch = createNormalizedFetch(avalancheFuji.id);
    const fetchWithPay = wrapFetchWithPayment(normalizedFetch, client, wallet, {
      maxValue: BigInt(10_000),
    });
    return await fetchWithPay(url);
  } catch (error) {
    console.error("Payment fetch error:", error);
    throw error;
  }
}

/**
 * Fetches content with payment (simplified version)
 * @param contentId - The ID of the content to fetch
 * @param client - Thirdweb client
 * @param wallet - Connected wallet
 * @param price - Price in USDC
 */
export async function fetchContentWithPayment(
  contentId: string,
  contentType: "article" | "file",
  client?: any,
): Promise<Response> {
  const url =
    contentType === "article"
      ? `/api/view/${contentId}`
      : `/api/download/${contentId}`;

  // Use Thirdweb's payment wrapper
  return await fetchWithPayment(client, url);
}
