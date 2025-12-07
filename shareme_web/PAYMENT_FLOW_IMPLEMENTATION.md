# Payment Flow Implementation Guide

This document explains how to implement the complete client-side payment flow with the x-payment header.

## Current Implementation Status

### ✅ What's Already Implemented

1. **Backend Payment Processing** (`/api/view/[id]/+server.ts`)
   - Receives and validates x-payment header
   - Uses Thirdweb's `settlePayment` to verify payments
   - Returns content after successful payment
   - Returns 402 Payment Required for unpaid content

2. **Payment Utility Module** (`src/lib/payment.ts`)
   - `fetchContentWithPayment()` - Fetches content with x-payment header
   - Placeholder for `initiatePayment()` function

3. **Frontend View Page** (`/view/[id]/+page.svelte`)
   - Uses `fetchContentWithPayment()` utility
   - Shows payment UI with price and content details
   - Handles payment button states (processing, disabled)
   - Displays payment errors

### ⚠️ What Needs to Be Implemented

The **client-side payment signing and proof generation** is not yet implemented. This requires:

1. Wallet connection integration
2. Payment transaction creation
3. Transaction signing with user's wallet
4. Payment proof generation for x-payment header

## How the Payment Flow Works

### Complete Flow Diagram

```
User visits /view/{contentId}
    ↓
fetchContentWithPayment(contentId) - NO x-payment header
    ↓
Backend checks payment
    ↓
Returns 402 Payment Required
    ↓
User sees payment prompt
    ↓
User clicks "Pay to View Content"
    ↓
handlePayment() function:
    1. Check wallet connection
    2. Create payment transaction
    3. Sign transaction with wallet
    4. Generate payment proof
    5. Store proof in paymentProof variable
    ↓
fetchContentWithPayment(contentId, paymentProof) - WITH x-payment header
    ↓
Backend verifies payment via settlePayment()
    ↓
Payment valid? → YES → Return content
    ↓
Content displayed to user
```

## Implementation Steps

### Step 1: Install Thirdweb Client SDK

The backend already has `thirdweb` installed. For client-side payment, you may need additional packages:

```bash
cd shareme_web
npm install thirdweb
```

### Step 2: Get Thirdweb Client ID

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Navigate to Settings → API Keys
3. Create a new **Client ID** (different from Secret Key)
4. Add to your `.env` file:

```env
PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
```

### Step 3: Implement Payment Transaction Creation

Update `src/lib/payment.ts` with the actual payment implementation:

```typescript
import { createThirdwebClient } from 'thirdweb';
import { avalancheFuji } from 'thirdweb/chains';
import { prepareContractCall, sendTransaction } from 'thirdweb';
import { USDC_FUJI_ADDRESS } from './constants';

export async function initiatePayment(
    contentId: string,
    price: number,
    creatorWalletAddress: string,
    userWallet: any
): Promise<string> {
    try {
        // 1. Create Thirdweb client
        const client = createThirdwebClient({
            clientId: import.meta.env.PUBLIC_THIRDWEB_CLIENT_ID,
        });

        // 2. Prepare USDC transfer transaction
        // This would transfer USDC from user to creator's wallet
        const transaction = prepareContractCall({
            contract: {
                address: USDC_FUJI_ADDRESS,
                chain: avalancheFuji,
                client,
            },
            method: 'transfer',
            params: [creatorWalletAddress, price * 1e6], // USDC has 6 decimals
        });

        // 3. Sign and send transaction
        const result = await sendTransaction({
            transaction,
            account: userWallet,
        });

        // 4. Generate payment proof
        // This should be the transaction hash or a signed message
        // that the backend can verify
        const paymentProof = result.transactionHash;

        return paymentProof;
    } catch (error) {
        console.error('Payment initiation failed:', error);
        throw error;
    }
}
```

### Step 4: Update the View Page Payment Handler

Update `handlePayment()` in `/view/[id]/+page.svelte`:

```typescript
async function handlePayment() {
    processingPayment = true;
    error = '';
    
    try {
        // Check if wallet is connected
        if (!$walletStore) {
            error = 'Please connect your wallet first';
            processingPayment = false;
            return;
        }

        // Initiate payment and get proof
        paymentProof = await initiatePayment(
            contentId,
            paymentInfo.price,
            paymentInfo.walletAddress,
            $walletStore
        );

        // Retry fetching content with payment proof
        await fetchContent(true);

        // If successful, content will be displayed
        
    } catch (err: any) {
        error = err.message || 'Payment failed';
        console.error('Payment error:', err);
    } finally {
        processingPayment = false;
    }
}
```

## Alternative: Using Thirdweb's x402 Client SDK

Thirdweb provides a dedicated x402 client SDK for handling payments. Here's how to use it:

### Install x402 Client Package

```bash
npm install @thirdweb-dev/payments
```

### Use x402 Payment Flow

```typescript
import { createPayment } from '@thirdweb-dev/payments';

async function handlePayment() {
    processingPayment = true;
    error = '';
    
    try {
        if (!$walletStore) {
            error = 'Please connect your wallet first';
            return;
        }

        // Create payment using x402 protocol
        const payment = await createPayment({
            resourceUrl: `/api/view/${contentId}`,
            method: 'GET',
            wallet: $walletStore,
            network: avalancheFuji,
            price: {
                amount: paymentInfo.price.toString(),
                asset: {
                    address: USDC_FUJI_ADDRESS,
                },
            },
        });

        // Get payment proof
        paymentProof = payment.proof;

        // Retry with payment
        await fetchContent(true);
        
    } catch (err: any) {
        error = err.message || 'Payment failed';
    } finally {
        processingPayment = false;
    }
}
```

## Testing the Payment Flow

### Test with Free Content

```bash
# Create free content
curl -X POST http://localhost:5173/api/shares \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Free Article",
    "content": "This is free!",
    "contentType": "text",
    "price": 0,
    "walletAddress": "0x0000000000000000000000000000000000000000"
  }'

# Visit /view/{id} - should display immediately
```

### Test with Paid Content

```bash
# Create paid content
curl -X POST http://localhost:5173/api/shares \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Article",
    "content": "This costs money!",
    "contentType": "text",
    "price": 5,
    "walletAddress": "0xYourCreatorWalletAddress"
  }'

# Visit /view/{id} - should show payment prompt
```

### Test Payment with x-payment Header

```bash
# Try to view without payment (should return 402)
curl http://localhost:5173/api/view/{id}

# Try to view with payment proof (should return content)
curl http://localhost:5173/api/view/{id} \
  -H "x-payment: {payment_proof_here}"
```

## Current Fetch Implementation

### What We Have Now

```typescript
// In /view/[id]/+page.svelte
async function fetchContent(withPayment: boolean = false) {
    // Uses the payment utility that includes x-payment header
    const response = await fetchContentWithPayment(
        contentId, 
        withPayment ? paymentProof : undefined
    );
    // ... handle response
}
```

```typescript
// In src/lib/payment.ts
export async function fetchContentWithPayment(
    contentId: string,
    paymentProof?: string
): Promise<Response> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    // This is the key part - includes x-payment header when proof exists
    if (paymentProof) {
        headers['x-payment'] = paymentProof;
    }
    
    return fetch(`/api/view/${contentId}`, {
        method: 'GET',
        headers,
    });
}
```

## Security Considerations

1. **Payment Verification**: The backend verifies all payments on-chain via Thirdweb
2. **No Trust Required**: Payment proof cannot be forged
3. **Atomic Transactions**: Payment and content access are linked
4. **Wallet Security**: Users maintain control of their private keys
5. **HTTPS Required**: Always use HTTPS in production

## Troubleshooting

### Payment Proof Not Working

- Verify the payment transaction was successful on-chain
- Check that the x-payment header is being sent correctly
- Ensure the payment amount matches the content price
- Verify the creator's wallet address is correct

### Wallet Connection Issues

- Ensure wallet is connected before attempting payment
- Check that the wallet has sufficient USDC balance
- Verify the wallet has approved USDC spending

### Backend Errors

- Check `THIRDWEB_SECRET_KEY` is set correctly
- Verify `THIRDWEB_SERVER_WALLET_ADDRESS` is correct
- Ensure the server wallet has gas for transactions
- Check network configuration (Avalanche Fuji)

## Next Steps

1. **Implement Full Payment Flow**: Complete the `initiatePayment()` function
2. **Add Wallet Connection**: Integrate wallet connection UI
3. **Test End-to-End**: Test complete payment flow with real wallets
4. **Add Transaction History**: Track payment transactions
5. **Implement Refunds**: Add refund mechanism if needed
6. **Production Database**: Replace in-memory storage with persistent database

## Resources

- [Thirdweb x402 Documentation](https://portal.thirdweb.com/x402)
- [Thirdweb SDK Documentation](https://portal.thirdweb.com/typescript/v5)
- [Avalanche Fuji Testnet](https://docs.avax.network/build/dapp/testnet-workflow)
- [USDC on Avalanche](https://developers.circle.com/stablecoins/docs/usdc-on-test-networks)
