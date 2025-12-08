// Payment utilities for handling x402 payments with Thirdweb
const { wrapFetchWithPayment } = await import("thirdweb/x402");
import { createWallet } from "thirdweb/wallets";
import { avalancheFuji } from "thirdweb/chains";
// Client-side Thirdweb client (uses clientId instead of secretKey)
export async function createPaymentClient(clientId: string) {
  const { createThirdwebClient } = await import("thirdweb");
  return createThirdwebClient({
    clientId,
  });
}

/**
 * Creates a normalized fetch function for a specific chain
 * This is required by Thirdweb's wrapFetchWithPayment
 */
export function createNormalizedFetch() {
  return async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    return fetch(input, init);
  };
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
    const normalizedFetch = createNormalizedFetch();
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
  client?: any,
  price?: number,
): Promise<Response> {
  const url = `/api/view/${contentId}`;

  // Use Thirdweb's payment wrapper
  return await fetchWithPayment(client, url);
}
