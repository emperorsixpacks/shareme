import fs from 'fs/promises';

export interface Share {
    id: string;
    content: string;
    price: number;
    contentType: string;
    title: string;
    fileName?: string;
    walletAddress: string; // Creator's smart wallet address
    createdAt: Date;
}

const dbPath = 'db.json';

async function readDb(): Promise<Share[]> {
    try {
        await fs.access(dbPath);
        const dbContent = await fs.readFile(dbPath, 'utf-8');
        const shares = JSON.parse(dbContent);
        // Dates are stored as strings in JSON, so we need to convert them back
        return shares.map((share: Share) => ({
            ...share,
            createdAt: new Date(share.createdAt),
        }));
    } catch (error) {
        return [];
    }
}

async function writeDb(shares: Share[]): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify(shares, null, 2));
}

export async function addShare(share: Share): Promise<void> {
    const shares = await readDb();
    shares.push(share);
    await writeDb(shares);
}

export async function getShareById(id: string): Promise<Share | undefined> {
    const shares = await readDb();
    return shares.find(s => s.id === id);
}

export async function updateShare(id: string, data: Partial<Share>): Promise<Share | undefined> {
    const shares = await readDb();
    const shareIndex = shares.findIndex(s => s.id === id);
    if (shareIndex === -1) {
        return undefined;
    }
    shares[shareIndex] = { ...shares[shareIndex], ...data };
    await writeDb(shares);
    return shares[shareIndex];
}

export async function getAllShares(): Promise<Share[]> {
    return await readDb();
}