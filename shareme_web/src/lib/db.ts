// Shared in-memory database for shares
// In production, this would be replaced with a real database

export interface Share {
    id: string;
    content: string;
    price: number;
    contentType: string;
    title: string;
    walletAddress: string; // Creator's smart wallet address
    createdAt: Date;
}

// In-memory storage
export const shares: Share[] = [];

// Helper functions
export function addShare(share: Share): void {
    shares.push(share);
}

export function getShareById(id: string): Share | undefined {
    return shares.find(s => s.id === id);
}

export function updateShare(id: string, data: Partial<Share>): Share | undefined {
    const shareIndex = shares.findIndex(s => s.id === id);
    if (shareIndex === -1) {
        return undefined;
    }
    shares[shareIndex] = { ...shares[shareIndex], ...data };
    return shares[shareIndex];
}

export function getAllShares(): Share[] {
    return shares;
}
