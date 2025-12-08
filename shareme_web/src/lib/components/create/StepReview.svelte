<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';
    import { signer } from '$lib/stores/wallet';
    import { toast } from '$lib/stores/toast';
    import { ethers } from 'ethers';
    import { goto } from '$app/navigation';

    let data: any = {};
    let isCreating = false;

    contentStore.subscribe(d => { data = d; });

    async function handleCreate() {
        if (!$signer) {
            toast.error('Please connect your wallet first');
            return;
        }

        isCreating = true;

        try {
            const response = await fetch('/api/shares', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    content: data.contentType === 'article' ? data.content : data.fileBase64,
                    price: data.price,
                    contentType: data.contentType,
                }),
            });

            if (!response.ok) throw new Error('Failed to save content');

            const savedContent = await response.json();
            
            const factoryAddress = "0x677577fE1b811D1B989F141fC0B9eb7c1e4a924d";
            const factory = new ethers.Contract(
                factoryAddress,
                ["function createWallet(bytes32 salt) public returns (address)"],
                $signer
            );

            const hex = savedContent.id.replace(/-/g, "");
            const spaceId = "0x" + hex.padEnd(64, "0");

            const tx = await factory.createWallet(spaceId);
            await tx.wait();

            toast.success('Content created successfully! 🎉');
            contentStore.reset();
            currentStep.set(0);
            goto(`/view/${savedContent.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create content');
        } finally {
            isCreating = false;
        }
    }

    function handleBack() {
        currentStep.set(data.contentType === 'article' ? 4 : 5);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Review & Create</h1>
        <p class="text-gray-400">Everything looks good? Let's create your content!</p>
    </div>

    <div class="step-content">
        <div class="review-card">
            <div class="review-item">
                <span class="review-label">Type:</span>
                <span class="review-value">{data.contentType === 'article' ? '✍️ Article' : '📁 File'}</span>
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
                    <span class="review-value">✓ Enabled (${data.minAmount} - ${data.maxAmount})</span>
                </div>
            {/if}
            <div class="review-item highlight">
                <span class="review-label">Your earnings:</span>
                <span class="review-value">${(data.price * 0.8).toFixed(2)} per sale</span>
            </div>
        </div>
    </div>

    <div class="step-actions">
        <button on:click={handleBack} class="btn-secondary" disabled={isCreating}>← Back</button>
        <button on:click={handleCreate} class="btn-primary" disabled={isCreating || !$signer}>
            {isCreating ? 'Creating...' : 'Create & Get Link 🚀'}
        </button>
    </div>
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
    .btn-primary, .btn-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
    }
    .btn-primary {
        background: linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119));
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
</style>
