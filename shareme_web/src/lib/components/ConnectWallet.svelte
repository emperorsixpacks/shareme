<script lang="ts">
    import { wallet, connect, disconnect } from "$lib/stores/wallet";
    import { toast } from "$lib/stores/toast";
    import { onMount } from "svelte";

    let account: any = null;
    let showDropdown = false;
    let balance = "0.00";
    let isConnecting = false;
    let copySuccess = false;

    wallet.subscribe((value) => {
        if (value) {
            account = value.accounts[0];
            fetchBalance();
        } else {
            account = null;
            balance = "0.00";
        }
    });

    async function fetchBalance() {
        if (!account) return;
        try {
            // Fetch balance from provider
            const provider = $wallet?.provider;
            if (provider) {
                const balanceWei = await provider.request({
                    method: 'eth_getBalance',
                    params: [account.address, 'latest']
                });
                const balanceEth = parseInt(balanceWei, 16) / 1e18;
                balance = balanceEth.toFixed(4);
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    }

    function shortenAddress(address: string): string {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    async function copyAddress() {
        if (!account) return;
        try {
            await navigator.clipboard.writeText(account.address);
            copySuccess = true;
            toast.success('Address copied to clipboard!');
            setTimeout(() => {
                copySuccess = false;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy address:', error);
            toast.error('Failed to copy address');
        }
    }

    async function handleConnect() {
        isConnecting = true;
        try {
            await connect();
            toast.success('Wallet connected successfully!');
        } catch (error) {
            console.error('Connection failed:', error);
            toast.error('Failed to connect wallet');
        } finally {
            isConnecting = false;
        }
    }

    function handleDisconnect() {
        disconnect();
        showDropdown = false;
        toast.info('Wallet disconnected');
    }

    function toggleDropdown() {
        showDropdown = !showDropdown;
    }

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.wallet-dropdown-container')) {
            showDropdown = false;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div class="wallet-container">
    {#if account}
        <div class="wallet-dropdown-container">
            <button class="wallet-button connected" on:click={toggleDropdown}>
                <div class="wallet-avatar">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="url(#gradient)" />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="20" y2="20">
                                <stop offset="0%" stop-color="#8B5CF6" />
                                <stop offset="100%" stop-color="#EC4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span class="address">{shortenAddress(account.address)}</span>
                <svg class="chevron" class:rotated={showDropdown} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            {#if showDropdown}
                <div class="dropdown-menu">
                    <div class="dropdown-header">
                        <div class="network-badge">
                            <div class="network-dot"></div>
                            <span>Avalanche Fuji</span>
                        </div>
                    </div>

                    <div class="dropdown-section">
                        <div class="balance-display">
                            <span class="balance-label">Balance</span>
                            <span class="balance-amount">{balance} AVAX</span>
                        </div>
                    </div>

                    <div class="dropdown-section">
                        <button class="dropdown-item" on:click={copyAddress}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M3.33333 10H2.66667C2.31304 10 1.97391 9.85952 1.72386 9.60947C1.47381 9.35943 1.33333 9.02029 1.33333 8.66667V2.66667C1.33333 2.31304 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31304 1.33333 2.66667 1.33333H8.66667C9.02029 1.33333 9.35943 1.47381 9.60947 1.72386C9.85952 1.97391 10 2.31304 10 2.66667V3.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>{copySuccess ? 'Copied!' : 'Copy Address'}</span>
                        </button>

                        <button class="dropdown-item disconnect" on:click={handleDisconnect}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6.66667 8H14M14 8L11.3333 5.33333M14 8L11.3333 10.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Disconnect</span>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <button class="wallet-button connect" on:click={handleConnect} disabled={isConnecting}>
            {#if isConnecting}
                <div class="spinner"></div>
                <span>Connecting...</span>
            {:else}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M17.5 6.66667H12.5L10.8333 5H5.83333C5.39131 5 4.96738 5.17559 4.65482 5.48816C4.34226 5.80072 4.16667 6.22464 4.16667 6.66667V13.3333C4.16667 13.7754 4.34226 14.1993 4.65482 14.5118C4.96738 14.8244 5.39131 15 5.83333 15H17.5C17.942 15 18.366 14.8244 18.6785 14.5118C18.9911 14.1993 19.1667 13.7754 19.1667 13.3333V8.33333C19.1667 7.89131 18.9911 7.46738 18.6785 7.15482C18.366 6.84226 17.942 6.66667 17.5 6.66667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Connect Wallet</span>
            {/if}
        </button>
    {/if}
</div>

<style>
    .wallet-container {
        position: relative;
        display: inline-block;
    }

    .wallet-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1.25rem;
        border: none;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
    }

    .wallet-button.connect {
        background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    .wallet-button.connect:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
    }

    .wallet-button.connect:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .wallet-button.connected {
        background: white;
        color: #1f2937;
        border: 1.5px solid #e5e7eb;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .wallet-button.connected:hover {
        border-color: #8B5CF6;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
    }

    .wallet-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .address {
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 0.875rem;
    }

    .chevron {
        transition: transform 0.2s ease;
    }

    .chevron.rotated {
        transform: rotate(180deg);
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .wallet-dropdown-container {
        position: relative;
    }

    .dropdown-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        min-width: 280px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
        overflow: hidden;
        z-index: 50;
        animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .dropdown-header {
        padding: 1rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .network-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: #f0fdf4;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #16a34a;
    }

    .network-dot {
        width: 8px;
        height: 8px;
        background: #22c55e;
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    .dropdown-section {
        padding: 0.75rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .dropdown-section:last-child {
        border-bottom: none;
    }

    .balance-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
    }

    .balance-label {
        font-size: 0.75rem;
        color: #6b7280;
        font-weight: 500;
    }

    .balance-amount {
        font-size: 0.875rem;
        font-weight: 700;
        color: #1f2937;
        font-family: 'Monaco', 'Courier New', monospace;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem;
        background: none;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    .dropdown-item:hover {
        background: #f9fafb;
    }

    .dropdown-item.disconnect {
        color: #dc2626;
    }

    .dropdown-item.disconnect:hover {
        background: #fef2f2;
    }

    .dropdown-item svg {
        flex-shrink: 0;
    }
</style>
