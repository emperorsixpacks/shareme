// Payment and blockchain configuration constants

// Avalanche Fuji Testnet USDC address
export const USDC_FUJI_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";

// Platform wallet address (update with your actual platform wallet)
// These will be loaded from environment variables in the server-side code
export const PLATFORM_WALLET_ADDRESS = "";

// Thirdweb server wallet address
export const THIRDWEB_SERVER_WALLET_ADDRESS = "";

// API endpoints
export const API_ENDPOINTS = {
  VIEW_CONTENT: "/api/view",
};

// Payment amounts configuration
export const PAYMENT_AMOUNTS = {
  DEFAULT: {
    amount: "1", // 1 USDC
  },
};

// SmartWallet Factory contract address on Avalanche Fuji
export const SMART_WALLET_FACTORY_ADDRESS = "0x677577fE1b811D1B989F141fC0B9eb7c1e4a924d";
