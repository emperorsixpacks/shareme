<script lang="ts">
    import { contentStore, currentStep } from "$lib/stores/createContent";
    import { signer } from "$lib/stores/wallet";
    import { toast } from "$lib/stores/toast";
    import { ethers } from "ethers";
    // import { goto } from "$app/navigation";

    let data: any = {};
    let isCreating = false;
    let shareLink = "";
    let showSuccess = false;

    contentStore.subscribe((d) => {
        data = d;
    });

    async function handleCreate() {
        if (!$signer) {
            toast.error("Please connect your wallet first");
            return;
        }

        isCreating = true;

        try {
            // 1. Save content to DB via API (without wallet address)
            const response = await fetch("/api/shares", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: data.title,
                    content: data.content,
                    price: data.price,
                    contentType: data.contentType,
                    walletAddress: null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save content");
            }

            const savedContent = await response.json();
            console.log("Content saved:", savedContent);

            // 2. Create the smart contract wallet
            const factoryAddress = "0x677577fE1b811D1B989F141fC0B9eb7c1e4a924d";
            const abi = [
                "function createWallet(bytes32 salt) public returns (address)",
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "creator",
                            type: "address",
                        },
                        {
                            indexed: false,
                            internalType: "address",
                            name: "wallet",
                            type: "address",
                        },
                    ],
                    name: "WalletCreated",
                    type: "event",
                },
            ];

            const factory = new ethers.Contract(factoryAddress, abi, $signer);

            // Convert UUID -> bytes32
            const hex = savedContent.id.replace(/-/g, "");
            const spaceId = "0x" + hex.padEnd(64, "0");

            console.log("Creating a new space...");
            const tx = await factory.createWallet(spaceId);
            const receipt = await tx.wait();

            console.log("Raw logs:", receipt.logs);

            const iface = new ethers.Interface(abi);

            let walletAddress = null;

            for (const log of receipt.logs) {
                try {
                    const decoded = iface.parseLog(log);

                    if (decoded?.name === "WalletCreated") {
                        walletAddress = decoded.args.wallet;
                        console.log("Decoded WalletCreated:", decoded.args);
                    }
                } catch (e) {
                    // log not part of this contract
                }
            }

            if (!walletAddress) {
                console.error(
                    "Could not find WalletCreated event in receipt",
                    receipt,
                );
                throw new Error(
                    "Could not find WalletCreated event in transaction receipt",
                );
            }

            console.log(`Space created!`);
            console.log(`  Wallet address: ${walletAddress}`);

            // 3. Update the share with the new wallet address
            const updateResponse = await fetch("/api/shares", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: savedContent.id,
                    walletAddress,
                }),
            });

            if (!updateResponse.ok) {
                throw new Error("Failed to update content with wallet address");
            }

            const updatedContent = await updateResponse.json();
            console.log("Content updated with wallet address:", updatedContent);

            // Generate the shareable link
            const baseUrl = window.location.origin;
            shareLink = `${baseUrl}/view/${savedContent.id}`;
            showSuccess = true;
            
            toast.success("Content created successfully!");
        } catch (error) {
            console.error("Failed to create space:", error);
            toast.error("Failed to create space. See console for details.");
        } finally {
            isCreating = false;
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copied to clipboard!");
    }
    function handleBack() {
        currentStep.set(data.contentType === "article" ? 4 : 5);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Review & Create</h1>
        <p class="text-gray-400">
            Everything looks good? Let's create your content!
        </p>
    </div>

    <div class="step-content">
        {#if showSuccess}
            <div class="success-card">
                <div class="success-icon">✓</div>
                <h2 class="success-title">Content Created Successfully!</h2>
                <p class="success-subtitle">Share this link with your audience</p>
                
                <div class="link-container">
                    <input 
                        type="text" 
                        value={shareLink} 
                        readonly 
                        class="link-input"
                    />
                    <button on:click={copyLink} class="copy-btn">
                        Copy Link
                    </button>
                </div>
                
                <a href={shareLink} target="_blank" class="view-link">
                    View Content →
                </a>
            </div>
        {:else}
            <div class="review-card">
                <div class="review-item">
                    <span class="review-label">Type:</span>
                    <span class="review-value"
                        >{data.contentType === "article"
                            ? "✍️ Article"
                            : "📁 File"}</span
                    >
                </div>
                <div class="review-item">
                    <span class="review-label">Title:</span>
                    <span class="review-value">{data.title}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">Price:</span>
                    <span class="review-value">${data.price} USDC</span>
                </div>
                {#if data.enableSubscription}
                    <div class="review-item">
                        <span class="review-label">Subscription:</span>
                        <span class="review-value"
                            >✓ Enabled (${data.minAmount} - ${data.maxAmount})</span
                        >
                    </div>
                {/if}
                <div class="review-item highlight">
                    <span class="review-label">Your earnings:</span>
                    <span class="review-value"
                        >${(data.price * 0.8).toFixed(2)} per sale</span
                    >
                </div>
            </div>
        {/if}
    </div>

    {#if !showSuccess}
        <div class="step-actions">
            <button
                on:click={handleBack}
                class="btn-secondary"
                disabled={isCreating}>← Back</button
            >
            <button
                on:click={handleCreate}
                class="btn-primary"
                disabled={isCreating || !$signer}
            >
                {isCreating ? "Creating..." : "Create & Get Link"}
            </button>
        </div>
    {/if}
</div>

<style>
    .step-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem 1rem;
        min-height: 60vh;
        display: flex;
        flex-direction: column;
    }
    .step-header {
        text-align: center;
        margin-bottom: 3rem;
    }
    .step-content {
        flex: 1;
    }
    .review-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 2rem;
    }
    .review-item {
        display: flex;
        justify-content: space-between;
        padding: 1rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .review-item:last-child {
        border-bottom: none;
    }
    .review-item.highlight {
        background: rgba(34, 197, 94, 0.1);
        margin: 1rem -1rem -1rem;
        padding: 1rem;
        border-radius: 0 0 1rem 1rem;
        border-bottom: none;
    }
    .review-label {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 500;
    }
    .review-value {
        color: white;
        font-weight: 600;
    }
    .review-item.highlight .review-value {
        color: rgb(34, 197, 94);
        font-size: 1.25rem;
    }
    .step-actions {
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        margin-top: 2rem;
    }
    .btn-primary,
    .btn-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
    }
    .btn-primary {
        background: linear-gradient(
            to right,
            rgb(147, 51, 234),
            rgb(219, 39, 119)
        );
        color: white;
        flex: 1;
    }
    .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
    }
    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
    }
    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
    }
    .btn-secondary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .success-card {
        background: rgba(34, 197, 94, 0.1);
        border: 2px solid rgba(34, 197, 94, 0.3);
        border-radius: 1rem;
        padding: 3rem 2rem;
        text-align: center;
    }

    .success-icon {
        width: 80px;
        height: 80px;
        background: rgba(34, 197, 94, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 3rem;
        color: rgb(34, 197, 94);
    }

    .success-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
    }

    .success-subtitle {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 2rem;
    }

    .link-container {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .link-input {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        color: white;
        font-size: 0.875rem;
    }

    .link-input:focus {
        outline: none;
        border-color: rgb(34, 197, 94);
    }

    .copy-btn {
        background: rgb(34, 197, 94);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .copy-btn:hover {
        background: rgb(22, 163, 74);
        transform: translateY(-2px);
    }

    .view-link {
        display: inline-block;
        color: rgb(34, 197, 94);
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .view-link:hover {
        color: rgb(22, 163, 74);
        transform: translateX(4px);
    }
</style>
