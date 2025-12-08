<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { fetchContentWithPayment, createPaymentClient } from "$lib/payment";
    import { wallet } from "$lib/stores/wallet";
    import { toast } from "$lib/stores/toast";
    import SkeletonLoader from "$lib/components/SkeletonLoader.svelte";
    import Confetti from "$lib/components/Confetti.svelte";

    let contentId = page.params.id;
    let content: any = null;
    let loading = true;
    let error = "";
    let paymentRequired = false;
    let paymentInfo: any = null;
    let processingPayment = false;
    let thirdwebClient: any = null;
    let showConfetti = false;

    onMount(async () => {
        const clientId = "ba038bb079074b48e0c1870922aec22b";
        if (clientId) {
            try {
                thirdwebClient = await createPaymentClient(clientId);
            } catch (err) {
                console.warn("Failed to initialize Thirdweb client:", err);
            }
        }

        await fetchContent();
    });

    async function fetchContent() {
        loading = true;
        error = "";

        try {
            // Use the payment utility function with wrapFetchWithPayment
            const response = await fetchContentWithPayment(
                contentId,
                thirdwebClient,
                $wallet,
                paymentInfo?.price,
            );
            const data = await response.json();

            if (response.ok) {
                content = data;
                paymentRequired = false;

                // Show success toast and confetti if this was after a payment
                if (paymentInfo) {
                    toast.success("Payment successful! Content unlocked 🎉");
                    showConfetti = true;
                }
            } else if (response.status === 402) {
                // Payment required
                paymentRequired = true;
                paymentInfo = data;
                error = "Payment required to view this content";
                toast.info("This content requires payment to access");
            } else {
                error = data.error || "Failed to load content";
                toast.error(error);
            }
        } catch (err) {
            error = "An error occurred while loading content";
            toast.error(error);
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function handlePayment() {
        processingPayment = true;
        error = "";

        try {
            // Check if wallet is connected
            if (!$wallet) {
                error = "Please connect your wallet first";
                toast.warning("Please connect your wallet first");
                processingPayment = false;
                return;
            }

            // Check if Thirdweb client is initialized
            if (!thirdwebClient) {
                error =
                    "Thirdweb client not initialized. Please configure PUBLIC_THIRDWEB_CLIENT_ID";
                toast.error("Payment system not configured");
                processingPayment = false;
                return;
            }

            toast.info("Processing payment...");

            // Fetch content with payment using wrapFetchWithPayment
            // This will automatically handle the payment flow
            await fetchContent();
        } catch (err: any) {
            error = err.message || "Payment failed";
            toast.error(error);
            console.error("Payment error:", err);
        } finally {
            processingPayment = false;
        }
    }
</script>

<Confetti bind:show={showConfetti} />

<div class="container">
    <div class="content-viewer">
        {#if loading}
            <div class="loading">
                <SkeletonLoader type="title" />
                <SkeletonLoader type="text" lines={1} />
                <div style="margin: 2rem 0;">
                    <SkeletonLoader type="text" lines={5} />
                </div>
            </div>
        {:else if error && !paymentRequired}
            <div class="error">
                <h2>Error</h2>
                <p>{error}</p>
                <a href="/">Go back home</a>
            </div>
        {:else if paymentRequired}
            <div class="payment-required">
                <h2>🔒 Payment Required</h2>
                <p>This content requires payment to access.</p>

                {#if paymentInfo}
                    <div class="payment-details">
                        <p>
                            <strong>Price:</strong>
                            {paymentInfo.price || "N/A"} USDC
                        </p>
                        <p><strong>Content ID:</strong> {contentId}</p>
                    </div>
                {/if}

                {#if error && !loading}
                    <div class="payment-error">
                        <p>⚠️ {error}</p>
                    </div>
                {/if}

                <button
                    on:click={handlePayment}
                    class="pay-button"
                    disabled={processingPayment}
                >
                    {#if processingPayment}
                        Processing Payment...
                    {:else}
                        Pay to View Content
                    {/if}
                </button>

                <p class="payment-note">
                    You'll need to connect your wallet and approve the payment
                    transaction.
                </p>
            </div>
        {:else if content}
            <div class="content-display">
                <header>
                    <h1>{content.title || "Untitled"}</h1>
                    {#if content.createdAt}
                        <p class="date">
                            Created: {new Date(
                                content.createdAt,
                            ).toLocaleDateString()}
                        </p>
                    {/if}
                    {#if content.message}
                        <p class="success-message">✓ {content.message}</p>
                    {/if}
                </header>

                <div class="content-body">
                    {#if content.contentType === "html"}
                        {@html content.content}
                    {:else}
                        <pre>{content.content}</pre>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 1rem 1rem 2rem;
    }

    .content-viewer {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    .error {
        text-align: center;
        padding: 1.5rem;
        color: #d32f2f;
    }

    .error h2 {
        margin-bottom: 0.75rem;
        font-size: 1.5rem;
    }

    .error a {
        display: inline-block;
        margin-top: 0.75rem;
        color: #1976d2;
        text-decoration: none;
    }

    .error a:hover {
        text-decoration: underline;
    }

    .payment-required {
        text-align: center;
        padding: 2rem 1.5rem;
    }

    .payment-required h2 {
        font-size: 1.75rem;
        margin-bottom: 0.75rem;
        color: #333;
    }

    .payment-details {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 1.25rem;
        margin: 1.5rem 0;
        text-align: left;
    }

    .payment-details p {
        margin: 0.4rem 0;
        color: #555;
    }

    .payment-error {
        background: #ffebee;
        border: 1px solid #ef5350;
        border-radius: 6px;
        padding: 0.875rem;
        margin: 0.875rem 0;
        color: #c62828;
    }

    .payment-error p {
        margin: 0;
        font-size: 0.9rem;
    }

    .pay-button {
        background: #1976d2;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition:
            background 0.3s,
            opacity 0.3s;
    }

    .pay-button:hover:not(:disabled) {
        background: #1565c0;
    }

    .pay-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .payment-note {
        margin-top: 1.25rem;
        font-size: 0.875rem;
        color: #666;
    }

    .content-display header {
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 1.25rem;
        margin-bottom: 1.5rem;
    }

    .content-display h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #333;
    }

    .date {
        color: #666;
        font-size: 0.9rem;
    }

    .success-message {
        color: #4caf50;
        font-weight: 500;
        margin-top: 0.5rem;
    }

    .content-body {
        line-height: 1.8;
        color: #333;
    }

    .content-body pre {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .content-body :global(img) {
        max-width: 100%;
        height: auto;
    }

    .content-body :global(a) {
        color: #1976d2;
        text-decoration: none;
    }

    .content-body :global(a:hover) {
        text-decoration: underline;
    }
</style>
