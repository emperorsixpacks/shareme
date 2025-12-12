# ShareMe 🚀

ShareMe is where creators get paid for their work, no middlemen needed. Write an article, upload a file, set your price, and share the link. When someone pays to view it, you get 80% instantly to your crypto wallet. We built this on Avalanche using smart contracts and Thirdweb's payment tech to make sure everything's transparent and automatic.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Smart Contracts](#smart-contracts)
- [Web Application](#web-application)
- [Blockchain Indexer](#blockchain-indexer)
- [Payment Flow](#payment-flow)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Think of ShareMe as a paywall for anything you create, but powered by crypto. Here's what makes it different:

**For Creators:**
You write something or upload a file, set how much you want to charge (in USDC stablecoin), and get a shareable link. When someone pays to view your content, the smart contract automatically splits the payment: you get 80%, the platform keeps 20%. The payment flow is designed to be direct and transparent.

**For Viewers:**
You only pay for what you actually want to see. No subscriptions, no bundles of stuff you don't care about. Connect your crypto wallet, pay the price the creator set, and you get access. All payments are verified on the blockchain for transparency.

**The Tech Behind It:**
We're using smart contracts on Avalanche Fuji testnet (fast and cheap transactions) with Thirdweb's x402 payment protocol. Each content space gets a unique smart wallet, and the revenue split is handled by the contract. Currently using in-memory storage for content (will need a real database for production).

## ✨ Features

### For Creators
- **Multi-Format Content**: Write rich-text articles or upload files (PDFs, videos, images, code, 3D assets)
- **Flexible Pricing**: Set custom prices or choose quick pricing options ($0.01, $1, $10, $50)
- **Smart Wallets**: Automatic wallet creation for each content space
- **Revenue Sharing**: Receive 80% of sales automatically
- **Rich Text Editor**: Full-featured editor with formatting options
- **Drag & Drop Upload**: Easy file uploads up to 100MB

### For Consumers
- **Pay-Per-View**: Only pay for content you want to access
- **USDC Payments**: Stable, predictable pricing
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other Web3 wallets
- **Instant Access**: View content immediately after payment verification
- **Secure Transactions**: All payments verified on-chain

### Platform Features
- **Decentralized**: Content ownership and payments on blockchain
- **Transparent**: All transactions verifiable on-chain
- **Automated Revenue Split**: Smart contracts handle payment distribution
- **x402 Protocol**: Industry-standard payment verification
- **Toast Notifications**: Real-time feedback for all actions
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

ShareMe consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                      ShareMe Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │   Smart      │  │   Blockchain │      │
│  │  (SvelteKit) │  │  Contracts   │  │   Indexer    │      │
│  │              │  │  (Solidity)  │  │   (DipDup)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                  │
│                           ▼                                  │
│                 Avalanche Fuji Testnet                       │
│                  (USDC Payments)                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Content Creation**: Creator writes/uploads content via Web App
2. **Smart Wallet Creation**: Factory contract deploys a new SmartWallet for the content
3. **Content Storage**: Content metadata stored in database, hash on-chain
4. **Payment Request**: Consumer attempts to view paid content
5. **Payment Processing**: Thirdweb x402 protocol verifies payment
6. **Revenue Distribution**: SmartWallet automatically splits payment (80/20)
7. **Content Access**: Consumer receives content after successful payment
8. **Indexing**: DipDup indexes all blockchain events for analytics

## 🛠️ Tech Stack

### Frontend
- **SvelteKit 2.x**: Modern web framework with SSR
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **TipTap**: Rich text editor
- **Ethers.js 6.x**: Ethereum library for Web3 interactions
- **Thirdweb SDK**: Web3 wallet connection and payments

### Smart Contracts
- **Solidity 0.8.20**: Smart contract language
- **Hardhat 3**: Development environment
- **OpenZeppelin**: Secure contract libraries
- **Avalanche Fuji**: Testnet deployment

### Backend & Indexing
- **SvelteKit API Routes**: Server-side endpoints
- **DipDup 8.5.1**: Blockchain indexer
- **Python 3**: Indexer runtime
- **PostgreSQL/SQLite**: Data storage options

### Blockchain
- **Avalanche Fuji Testnet**: Layer 1 blockchain
- **USDC**: Stablecoin for payments
- **Thirdweb x402**: Payment protocol

## 📁 Project Structure

```
shareme/
├── shareme_web/              # SvelteKit web application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/   # Reusable UI components
│   │   │   │   ├── landing/  # Landing page components
│   │   │   │   ├── ConnectWallet.svelte
│   │   │   │   ├── RichTextEditor.svelte
│   │   │   │   ├── Toast.svelte
│   │   │   │   ├── Confetti.svelte
│   │   │   │   └── SkeletonLoader.svelte
│   │   │   ├── stores/       # Svelte stores
│   │   │   │   ├── wallet.ts # Wallet state management
│   │   │   │   └── toast.ts  # Toast notifications
│   │   │   ├── constants.ts  # App constants
│   │   │   ├── db.ts         # In-memory database
│   │   │   └── payment.ts    # Payment utilities
│   │   ├── routes/
│   │   │   ├── +page.svelte  # Landing page
│   │   │   ├── share/        # Content creation page
│   │   │   ├── view/[id]/    # Content viewing page
│   │   │   └── api/          # API endpoints
│   │   │       ├── shares/   # Content CRUD
│   │   │       └── view/[id]/ # Payment-gated content
│   │   └── app.html          # HTML template
│   ├── static/               # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── svelte.config.js
│   └── .env                  # Environment variables
│
├── shareme_contracts/        # Smart contracts
│   ├── contracts/
│   │   ├── SmartWallet.sol   # Payment splitting wallet
│   │   ├── SpacesContract.sol # Content registry
│   │   └── ERC20Mock.sol     # Testing token
│   ├── ignition/
│   │   └── modules/          # Deployment scripts
│   ├── scripts/              # Utility scripts
│   ├── test/                 # Contract tests
│   ├── hardhat.config.ts
│   └── package.json
│
└── dipdup_indexer/           # Blockchain indexer
    ├── main.py               # Indexer configuration
    ├── pyproject.toml
    ├── Makefile
    └── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (for indexer)
- **Git**
- **MetaMask** or compatible Web3 wallet
- **Avalanche Fuji testnet** AVAX (for gas fees)
- **USDC on Fuji** (for testing payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/emperorsixpacks/shareme.git
cd shareme
```

2. **Set up the Web Application**
```bash
cd shareme_web
npm install
```

3. **Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)
```

4. **Set up Smart Contracts** (Optional - contracts already deployed)
```bash
cd ../shareme_contracts
npm install
```

5. **Set up Blockchain Indexer** (Optional)
```bash
cd ../dipdup_indexer
curl -Lsf https://dipdup.io/install.py | python3
make install
```

### Running the Application

#### Development Mode

```bash
cd shareme_web
npm run dev
```

The application will be available at `http://localhost:5173`

#### Production Build

```bash
npm run build
npm run preview
```

## 📜 Smart Contracts

### SmartWallet Contract

The `SmartWallet` contract handles automatic payment distribution:

**Key Features:**
- **Automated Revenue Split**: 80% to creator, 20% to platform
- **Multi-Token Support**: Configurable allowed assets (USDC, etc.)
- **Controller Pattern**: Only authorized controller can trigger transfers
- **Event Logging**: All payments tracked on-chain

**Main Functions:**
```solidity
// Forward payment with automatic split
function forwardTransfer(address token, uint256 amount) external onlyController

// Add supported payment token
function addAllowedAsset(address _token) external onlyController

// Update platform fee percentage
function updatePlatformFee(uint256 newFee) external onlyController
```

**Deployed Address (Fuji):** `0xa9A5ccb6cd45451189A61F7c15ACb96a03e87D99`

### SmartWalletFactory Contract

Factory pattern for creating new SmartWallet instances:

**Key Features:**
- **One Wallet Per Space**: Each content space gets unique wallet
- **Creator Tracking**: Maps creators to their wallets
- **Space Management**: Prevents duplicate space creation

**Main Functions:**
```solidity
// Create new wallet for content space
function createWallet(bytes32 spaceID) external returns (address)
```

### SpacesContract

Registry for content metadata:

**Key Features:**
- **Content Registration**: Store content hash and creator
- **Existence Verification**: Prevent duplicate content IDs
- **Event Emission**: Track content creation on-chain

**Main Functions:**
```solidity
// Register new content
function createContent(bytes32 contentId, uint256 price, string memory contentHash) external
```

### Deployment

Contracts are deployed on **Avalanche Fuji Testnet**:

```bash
cd shareme_contracts
npx hardhat ignition deploy ignition/modules/SmartWallet.ts --network fuji
```

## 🌐 Web Application

### Key Pages

#### Landing Page (`/`)
- Hero section with value proposition
- Features highlight
- How it works guide
- Call to action
- Footer with links

#### Create Content (`/share`)
- Tab-based interface (Write Article / Upload File)
- Rich text editor with formatting
- File upload with drag & drop
- Pricing configuration
- Smart wallet creation
- Shareable link generation

#### View Content (`/view/[id]`)
- Content preview
- Payment gate for paid content
- Wallet connection prompt
- Payment processing
- Content display after payment
- Skeleton loaders for better UX

### API Endpoints

#### POST `/api/shares`
Create new content and save to database.

**Request Body:**
```json
{
  "title": "My Article",
  "content": "<p>Article content...</p>",
  "price": 5.00,
  "contentType": "write"
}
```

**Response:**
```json
{
  "id": "uuid-v4",
  "title": "My Article",
  "content": "<p>Article content...</p>",
  "price": 5.00,
  "contentType": "write",
  "createdAt": "2025-01-08T10:00:00Z"
}
```

#### GET `/api/view/[id]`
Retrieve content with payment verification.

**Headers:**
```
x-payment: <payment_proof_hash>  // Optional, required for paid content
```

**Response (Free Content):**
```json
{
  "id": "uuid-v4",
  "title": "Free Article",
  "content": "<p>Content...</p>",
  "price": 0
}
```

**Response (Paid Content - No Payment):**
```
HTTP 402 Payment Required
{
  "error": "Payment required",
  "price": 5.00,
  "walletAddress": "0x..."
}
```

**Response (Paid Content - With Payment):**
```json
{
  "id": "uuid-v4",
  "title": "Premium Article",
  "content": "<p>Premium content...</p>",
  "price": 5.00
}
```

### Components

#### ConnectWallet
Wallet connection UI with Web3-Onboard integration.

**Features:**
- Multiple wallet support (MetaMask, WalletConnect)
- Network switching to Avalanche Fuji
- Account display and disconnect
- Reactive wallet state

#### RichTextEditor
TipTap-based rich text editor.

**Features:**
- Bold, italic, underline formatting
- Headings (H1, H2, H3)
- Bullet and numbered lists
- Links
- Code blocks
- Undo/redo

#### Toast
Global notification system.

**Usage:**
```typescript
import { toast } from '$lib/stores/toast';

toast.success('Content created!');
toast.error('Payment failed');
toast.info('Connecting wallet...');
```

#### SkeletonLoader
Loading placeholders for better perceived performance.

#### Confetti
Celebration animation for successful actions.

## 🔍 Blockchain Indexer

The DipDup indexer is set up to track on-chain events for analytics and monitoring (integration in progress).

### Setup

```bash
cd dipdup_indexer
make install
source .venv/bin/activate
```

### Running

**In-memory mode:**
```bash
dipdup run
```

**With SQLite:**
```bash
dipdup -C sqlite run
```

**With PostgreSQL (Docker Compose):**
```bash
dipdup -C compose config env -o deploy/.env
# Edit deploy/.env
make up
```

### Events to Index

- `ContentCreated`: New content registration
- `WalletCreated`: New smart wallet deployment
- `PaymentReceived`: Payment transactions
- `PaymentSplit`: Revenue distribution events

*Note: Indexer integration is currently in progress.*

## 💳 Payment Flow

ShareMe uses Thirdweb's x402 protocol for payment verification:

### Flow Diagram

```
┌─────────────┐
│   Consumer  │
│ Visits Link │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Fetch Content  │ ◄── No x-payment header
│   (API Call)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Backend Checks  │
│ Payment Status  │
└──────┬──────────┘
       │
       ├─── Free Content ──► Display Content
       │
       └─── Paid Content ──► Return 402 Payment Required
                              │
                              ▼
                        ┌──────────────┐
                        │ Show Payment │
                        │    Prompt    │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ User Clicks  │
                        │ "Pay to View"│
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Connect      │
                        │ Wallet       │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Create USDC  │
                        │ Transaction  │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Sign with    │
                        │ Wallet       │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Generate     │
                        │ Payment Proof│
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Retry Fetch  │ ◄── WITH x-payment header
                        │ with Proof   │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Backend      │
                        │ Verifies via │
                        │ settlePayment│
                        └──────┬───────┘
                               │
                               ├─── Valid ──► Return Content
                               │
                               └─── Invalid ──► Return 402 Error
```

### Implementation Status

✅ **Implemented:**
- Backend payment verification
- x-payment header handling
- Payment UI components
- Error handling
- Toast notifications

⚠️ **In Progress:**
- Client-side payment signing
- Transaction creation
- Payment proof generation

See [PAYMENT_FLOW_IMPLEMENTATION.md](shareme_web/PAYMENT_FLOW_IMPLEMENTATION.md) for detailed implementation guide.

## 🔐 Environment Variables

### Web Application (.env)

```bash
# Thirdweb Configuration
THIRDWEB_SECRET_KEY=your_secret_key_here
PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
THIRDWEB_SERVER_WALLET_ADDRESS=0x...
PLATFORM_WALLET_ADDRESS=0x...
```

### Getting Thirdweb Keys

1. Visit [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create a new project
3. Navigate to Settings → API Keys
4. Create **Secret Key** (for server-side)
5. Create **Client ID** (for client-side)

### Smart Contracts

Update `hardhat.config.ts` with your private key:

```typescript
accounts: [process.env.PRIVATE_KEY || ""]
```

## 🧪 Development

### Running Tests

**Smart Contracts:**
```bash
cd shareme_contracts
npx hardhat test
```

**Web Application:**
```bash
cd shareme_web
npm run check
```

### Code Quality

**Type Checking:**
```bash
npm run check
```

**Build:**
```bash
npm run build
```

### Local Development Tips

1. **Use Fuji Testnet Faucet**: Get free AVAX at [Avalanche Faucet](https://faucet.avax.network/)
2. **Get Test USDC**: Use the USDC faucet or swap AVAX for USDC on testnet DEX
3. **MetaMask Setup**: Add Avalanche Fuji network manually
   - Network Name: Avalanche Fuji C-Chain
   - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
   - Chain ID: 43113
   - Symbol: AVAX
   - Explorer: https://testnet.snowtrace.io/

## 🚢 Deployment

### Web Application

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Deploy the build/ directory
```

**Docker:**
```bash
docker build -t shareme-web .
docker run -p 3000:3000 shareme-web
```

### Smart Contracts

Deploy to Avalanche Fuji:
```bash
cd shareme_contracts
npx hardhat ignition deploy ignition/modules/SmartWallet.ts --network fuji
```

Deploy to Avalanche Mainnet:
```bash
npx hardhat ignition deploy ignition/modules/SmartWallet.ts --network mainnet
```

### Indexer

Deploy with Docker Compose:
```bash
cd dipdup_indexer
make up
```

## 📊 Project Status

### Completed Features
- ✅ Smart contract development and deployment (Fuji testnet)
- ✅ Web application UI/UX
- ✅ Content creation (write & upload)
- ✅ Wallet connection interface
- ✅ Payment gate UI
- ✅ Backend payment verification (with Thirdweb x402)
- ✅ Revenue splitting logic in smart contracts
- ✅ Toast notifications
- ✅ Responsive design
- ✅ In-memory content storage

### In Progress
- 🔄 Client-side payment signing and transaction creation
- 🔄 Payment proof generation
- 🔄 Blockchain indexer integration
- 🔄 Production database setup

### Known Limitations
- ⚠️ Currently using in-memory storage (data resets on server restart)
- ⚠️ Payment flow requires Thirdweb credentials to be fully functional
- ⚠️ Running on Avalanche Fuji testnet (not production mainnet)
- ⚠️ Client-side payment signing not yet implemented

### Planned Features
- 📋 Complete client-side payment implementation
- 📋 Persistent database (replace in-memory storage)
- 📋 Subscription bundles
- 📋 Content analytics dashboard
- 📋 Creator profiles
- 📋 Content discovery/search
- 📋 Social sharing features
- 📋 Multi-chain support
- 📋 NFT-gated content

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure code passes linting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Thirdweb** - Web3 development platform and x402 protocol
- **Avalanche** - Fast and low-cost blockchain infrastructure
- **SvelteKit** - Modern web framework
- **DipDup** - Blockchain indexing framework
- **OpenZeppelin** - Secure smart contract libraries

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/emperorsixpacks/shareme/issues)
- **Documentation**: See individual README files in each directory
- **Payment Integration**: See [PAYMENT_INTEGRATION.md](shareme_web/PAYMENT_INTEGRATION.md)
- **Payment Flow**: See [PAYMENT_FLOW_IMPLEMENTATION.md](shareme_web/PAYMENT_FLOW_IMPLEMENTATION.md)

## 🔗 Links

- **Live Demo**: Coming soon
- **GitHub**: https://github.com/emperorsixpacks/shareme
- **Thirdweb**: https://thirdweb.com
- **Avalanche**: https://avax.network
- **DipDup**: https://dipdup.io

---

**Built with ❤️ by the ShareMe Team**

*Empowering creators through decentralized content monetization*
