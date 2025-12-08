// Payment utilities for handling x402 payments with Thirdweb
const { wrapFetchWithPayment } = await import("thirdweb/x402");
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
export function createNormalizedFetch(chainId: number) {
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
  wallet: any,
  url: string,
): Promise<Response> {
  try {
    // Create normalized fetch for Avalanche Fuji (chainId: 43113)
    const normalizedFetch = createNormalizedFetch(43113);

    // Wrap fetch with payment
    const fetchWithPay = wrapFetchWithPayment(normalizedFetch, client, wallet);

    // Execute the fetch with payment
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
  wallet?: any,
  price?: number,
): Promise<Response> {
  const url = `/api/view/${contentId}`;

  // If no wallet or price, just fetch normally (for free content)
  if (!wallet || !price || price === 0) {
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Use Thirdweb's payment wrapper
  return await fetchWithPayment(client, wallet, url);
}
