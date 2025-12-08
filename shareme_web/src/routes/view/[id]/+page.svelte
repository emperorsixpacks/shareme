<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { fetchContentWithPayment, createPaymentClient } from "$lib/payment";
    import { toast } from "$lib/stores/toast";
    import SkeletonLoader from "$lib/components/SkeletonLoader.svelte";
    import Confetti from "$lib/components/Confetti.svelte";

    let contentId = $page.params.id;
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

        await fetchMeta();
    });

    async function fetchMeta() {
        loading = true;
        error = "";

        try {
            const response = await fetch(`/api/view/${contentId}/meta`);
            const data = await response.json();

            if (response.ok) {
                // If content is free, fetch it right away
                if (!data.price || data.price === 0) {
                    await fetchContent();
                } else {
                    // Otherwise, set payment info and wait for user action
                    paymentInfo = data;
                    paymentRequired = true;
                    loading = false;
                }
            } else {
                error = data.error || "Failed to load content metadata";
                toast.error(error);
                loading = false;
            }
        } catch (err) {
            error = "An error occurred while loading content metadata";
            toast.error(error);
            console.error(err);
            loading = false;
        }
    }

    async function fetchContent() {
        // If not initiated by payment, set loading state
        if (!processingPayment) {
            loading = true;
        }
        error = "";

        try {
            const response = await fetchContentWithPayment(
                contentId,
                thirdwebClient,
            );
            const data = await response.json();

            if (response.ok) {
                content = data;
                paymentRequired = false;

                // Show success toast and confetti if this was after a payment
                if (paymentInfo && paymentInfo.price > 0) {
                    toast.success("Payment successful! Content unlocked 🎉");
                    showConfetti = true;
                }
            } else if (response.status === 402) {
                paymentRequired = true;
                // The payment modal will show the error from `fetchContentWithPayment`
                // We update paymentInfo with the latest from the server
                paymentInfo = { ...paymentInfo, ...data };
                error =
                    data.errorMessage ||
                    "Payment required to view this content";
                toast.info(
                    data.errorMessage ||
                        "This content requires payment to access",
                );
            } else if (response.status === 404) {
                // Content not found
                error = "Content not found. It may have been deleted or the link is invalid.";
                toast.error(error);
            } else {
                error = data.error || "Failed to load content";
                toast.error(error);
            }
        } catch (err: any) {
            error = err.message || "An error occurred while loading content";
            toast.error(error);
            console.error("Error loading content:", err);
        } finally {
            loading = false;
        }
    }

    async function handlePayment() {
        processingPayment = true;
        error = "";

        try {
            if (!thirdwebClient) {
                error =
                    "Thirdweb client not initialized. Please configure PUBLIC_THIRDWEB_CLIENT_ID";
                toast.error("Payment system not configured");
                processingPayment = false;
                return;
            }

            toast.info("Processing payment...");

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
                <div class="payment-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="url(#gradient)" stroke-width="2"/>
                        <path d="M12 7V13M12 16H12.01" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round"/>
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:rgb(147, 51, 234);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:rgb(219, 39, 119);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h2 class="payment-title">Premium Content</h2>
                <p class="payment-subtitle">Unlock this exclusive content with a one-time payment</p>

                {#if paymentInfo}
                    <div class="payment-card">
                        <div class="price-section">
                            <span class="price-label">Price</span>
                            <div class="price-amount">
                                <span class="currency">$</span>
                                <span class="amount">{paymentInfo.price || "0"}</span>
                                <span class="token">USDC</span>
                            </div>
                        </div>

                        <div class="payment-features">
                            <div class="feature">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17L4 12" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Instant access after payment</span>
                            </div>
                            <div class="feature">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17L4 12" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Secure blockchain transaction</span>
                            </div>
                            <div class="feature">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17L4 12" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Support the creator directly</span>
                            </div>
                        </div>

                        {#if error && !loading}
                            <div class="payment-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
                                    <path d="M12 8V12M12 16H12.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        {/if}

                        <button
                            on:click={handlePayment}
                            class="pay-button"
                            disabled={processingPayment}
                        >
                            {#if processingPayment}
                                <div class="spinner"></div>
                                <span>Processing...</span>
                            {:else}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Unlock Content</span>
                            {/if}
                        </button>

                        <p class="payment-note">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Connect your wallet to complete the payment
                        </p>
                    </div>
                {/if}
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
        padding: 1.5rem 1rem;
        max-width: 420px;
        margin: 0 auto;
    }

    .payment-icon {
        margin-bottom: 0.75rem;
        animation: float 3s ease-in-out infinite;
    }

    .payment-icon svg {
        width: 48px;
        height: 48px;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
    }

    .payment-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
        background: linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .payment-subtitle {
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.8rem;
        margin-bottom: 1rem;
    }

    .payment-card {
        background: linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%);
        border: 1px solid rgba(147, 51, 234, 0.2);
        border-radius: 0.875rem;
        padding: 1.25rem;
        margin-top: 0.75rem;
    }

    .price-section {
        text-align: center;
        padding: 0.875rem;
        background: white;
        border-radius: 0.625rem;
        margin-bottom: 0.875rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .price-label {
        display: block;
        font-size: 0.7rem;
        color: rgba(0, 0, 0, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.2rem;
        font-weight: 600;
    }

    .price-amount {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.2rem;
    }

    .currency {
        font-size: 1.1rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.7);
    }

    .amount {
        font-size: 1.875rem;
        font-weight: 700;
        background: linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .token {
        font-size: 0.9rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.5);
    }

    .payment-features {
        margin: 0.875rem 0;
        text-align: left;
    }

    .feature {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0;
        color: rgba(0, 0, 0, 0.7);
        font-size: 0.8rem;
    }

    .feature svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    .payment-error {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        justify-content: center;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 0.5rem;
        padding: 0.625rem;
        margin: 0.625rem 0;
        color: #dc2626;
        font-size: 0.75rem;
    }

    .payment-error svg {
        width: 13px;
        height: 13px;
        flex-shrink: 0;
    }

    .pay-button {
        width: 100%;
        background: linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119));
        color: white;
        border: none;
        padding: 0.75rem 1.25rem;
        font-size: 0.9rem;
        font-weight: 600;
        border-radius: 0.625rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        margin-top: 0.875rem;
    }

    .pay-button svg {
        width: 16px;
        height: 16px;
    }

    .pay-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(147, 51, 234, 0.3);
    }

    .pay-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .spinner {
        width: 13px;
        height: 13px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .payment-note {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        margin-top: 0.625rem;
        font-size: 0.7rem;
        color: rgba(0, 0, 0, 0.5);
    }

    .payment-note svg {
        width: 11px;
        height: 11px;
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