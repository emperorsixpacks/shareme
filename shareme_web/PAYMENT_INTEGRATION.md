# Payment Integration Guide

This document explains how the payment-gated content viewing system works in ShareMe.

## Overview

The payment integration uses Thirdweb's x402 protocol to enable pay-per-view content. When users create content, they can set a price, and viewers must pay to access it. Payments are sent directly to the creator's smart wallet address.

## Architecture

### Key Components

1. **Content Creation API** (`/api/shares`)
   - Stores content with metadata including price and creator's wallet address
   - Returns a unique content ID that can be shared

2. **Content Viewing API** (`/api/view/[id]`)
   - Handles payment verification using Thirdweb's `settlePayment`
   - Returns content only after successful payment or if content is free
   - Returns 402 Payment Required status for unpaid content

3. **View Page** (`/view/[id]`)
   - Frontend page that displays content or payment prompt
   - Shows payment details and handles user interaction

## How It Works

### Flow Diagram

```
User clicks content link
    ↓
GET /api/view/[contentId]
    ↓
Check if content exists
    ↓
Is content free? → YES → Return content
    ↓ NO
Check x-payment header
    ↓
settlePayment() via Thirdweb
    ↓
Payment valid? → YES → Return content
    ↓ NO
Return 402 Payment Required
```

### Payment Settlement

The payment is handled by Thirdweb's x402 protocol:

```typescript
const result = await settlePayment({
    resourceUrl: `/api/view/${contentId}`,
    method: 'GET',
    paymentData,                        // From x-payment header
    payTo: share.walletAddress,         // Creator's smart wallet
    network: avalancheFuji,             // Avalanche Fuji testnet
    price: {
        amount: share.price.toString(),
        asset: {
            address: USDC_FUJI_ADDRESS, // USDC token
        },
    },
    facilitator: thirdwebFacilitator,
});
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `shareme_web` directory:

```bash
cp .env.example .env
```

Then fill in the required values:

```env
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
THIRDWEB_SERVER_WALLET_ADDRESS=your_server_wallet_address
PLATFORM_WALLET_ADDRESS=your_platform_wallet_address
```

**Getting Thirdweb Credentials:**
1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create an account or sign in
3. Navigate to Settings → API Keys
4. Create a new secret key
5. Copy the secret key and server wallet address

### 2. Install Dependencies

```bash
cd shareme_web
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

## Usage

### Creating Content with Payment

When creating content via the `/api/shares` endpoint:

```typescript
const response = await fetch('/api/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: 'My Premium Content',
        content: '<p>This is premium content</p>',
        contentType: 'html',
        price: 5,  // 5 USDC
        walletAddress: '0x...' // Creator's smart wallet address
    })
});

const { id } = await response.json();
// Share this link: /view/{id}
```

### Viewing Content

Users can access content at `/view/[id]`. The page will:

1. **Free Content**: Display immediately
2. **Paid Content**: Show payment prompt with:
   - Content price in USDC
   - Pay button to initiate payment
   - Payment status messages

### Payment Flow (Client-Side)

The payment is initiated through the x-payment header. The client needs to:

1. Connect their wallet
2. Approve USDC spending
3. Sign the payment transaction
4. Include payment proof in the `x-payment` header
5. Retry the GET request with the payment header

## Data Model

### Share Object

```typescript
interface Share {
    id: string;              // Unique content ID
    content: string;         // The actual content (HTML, text, etc.)
    price: number;           // Price in USDC (0 for free)
    contentType: string;     // 'html', 'text', etc.
    title: string;           // Content title
    walletAddress: string;   // Creator's smart wallet address
    createdAt: Date;         // Creation timestamp
}
```

## Smart Contract Integration

The system uses the deployed SmartWallet contracts:

- **SmartWalletFactory**: `0xa9A5ccb6cd45451189A61F7c15ACb96a03e87D99` (Avalanche Fuji)
- **USDC Token**: `0x5425890298aed601595a70AB815c96711a31Bc65` (Avalanche Fuji)

Each creator has their own SmartWallet that:
- Receives payments from viewers
- Automatically splits fees (80% creator, 20% platform)
- Supports multiple ERC20 tokens

## API Reference

### POST /api/shares

Create new content.

**Request Body:**
```json
{
    "title": "Content Title",
    "content": "Content body",
    "contentType": "html",
    "price": 5,
    "walletAddress": "0x..."
}
```

**Response:**
```json
{
    "id": "uuid",
    "title": "Content Title",
    "content": "Content body",
    "contentType": "html",
    "price": 5,
    "walletAddress": "0x...",
    "createdAt": "2025-12-06T..."
}
```

### GET /api/view/[id]

View content (with payment if required).

**Headers:**
- `x-payment`: Payment proof (optional, required for paid content)

**Response (Success):**
```json
{
    "id": "uuid",
    "title": "Content Title",
    "content": "Content body",
    "contentType": "html",
    "createdAt": "2025-12-06T...",
    "message": "Payment successful! Access granted."
}
```

**Response (Payment Required - 402):**
```json
{
    "error": "Payment required",
    "price": 5,
    "paymentDetails": { ... }
}
```

## Testing

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

# View it (no payment needed)
curl http://localhost:5173/api/view/{id}
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
    "walletAddress": "0x..."
  }'

# Try to view without payment (should return 402)
curl http://localhost:5173/api/view/{id}
```

## Security Considerations

1. **Payment Verification**: All payments are verified on-chain through Thirdweb
2. **Content Protection**: Paid content is only returned after successful payment
3. **Wallet Validation**: Creator wallet addresses should be validated
4. **Rate Limiting**: Consider implementing rate limiting on API endpoints
5. **Environment Variables**: Never commit `.env` files to version control

## Troubleshooting

### Common Issues

**"Payment required" even after paying:**
- Check that the `x-payment` header is included in the request
- Verify the payment was successful on-chain
- Ensure the payment amount matches the content price

**"Content not found" error:**
- Verify the content ID is correct
- Check that the content was successfully created
- Ensure the in-memory database hasn't been reset (use persistent storage in production)

**Thirdweb errors:**
- Verify your `THIRDWEB_SECRET_KEY` is correct
- Check that the server wallet has sufficient funds for gas
- Ensure you're using the correct network (Avalanche Fuji)

## Production Considerations

1. **Database**: Replace in-memory storage (`src/lib/db.ts`) with a real database (PostgreSQL, MongoDB, etc.)
2. **Payment Tracking**: Store payment receipts and transaction hashes
3. **Caching**: Implement caching for frequently accessed content
4. **CDN**: Use a CDN for content delivery
5. **Monitoring**: Add logging and monitoring for payment transactions
6. **Backup**: Regular backups of content and payment data

## Next Steps

- Implement wallet connection on the frontend
- Add payment transaction signing
- Create a dashboard for creators to manage their content
- Add analytics for content views and earnings
- Implement content categories and search
