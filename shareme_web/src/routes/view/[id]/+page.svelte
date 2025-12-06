<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    let contentId = '';
    let content: any = null;
    let loading = true;
    let error = '';
    let paymentRequired = false;
    let paymentInfo: any = null;

    onMount(async () => {
        contentId = $page.params.id;
        await fetchContent();
    });

    async function fetchContent() {
        loading = true;
        error = '';
        
        try {
            const response = await fetch(`/api/view/${contentId}`);
            const data = await response.json();
            
            if (response.ok) {
                content = data;
                paymentRequired = false;
            } else if (response.status === 402) {
                // Payment required
                paymentRequired = true;
                paymentInfo = data;
                error = 'Payment required to view this content';
            } else {
                error = data.error || 'Failed to load content';
            }
        } catch (err) {
            error = 'An error occurred while loading content';
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function handlePayment() {
        // This would integrate with the payment flow
        // For now, we'll show a message
        alert('Payment integration would be handled here using the x-payment header');
    }
</script>

<div class="container">
    <div class="content-viewer">
        {#if loading}
            <div class="loading">
                <p>Loading content...</p>
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
                        <p><strong>Price:</strong> {paymentInfo.price || 'N/A'} USDC</p>
                        <p><strong>Content ID:</strong> {contentId}</p>
                    </div>
                {/if}
                
                <button on:click={handlePayment} class="pay-button">
                    Pay to View Content
                </button>
                
                <p class="payment-note">
                    You'll need to connect your wallet and approve the payment transaction.
                </p>
            </div>
        {:else if content}
            <div class="content-display">
                <header>
                    <h1>{content.title || 'Untitled'}</h1>
                    {#if content.createdAt}
                        <p class="date">Created: {new Date(content.createdAt).toLocaleDateString()}</p>
                    {/if}
                    {#if content.message}
                        <p class="success-message">✓ {content.message}</p>
                    {/if}
                </header>
                
                <div class="content-body">
                    {#if content.contentType === 'html'}
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
        padding: 2rem;
    }

    .content-viewer {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 2rem;
    }

    .loading {
        text-align: center;
        padding: 3rem;
        color: #666;
    }

    .error {
        text-align: center;
        padding: 2rem;
        color: #d32f2f;
    }

    .error h2 {
        margin-bottom: 1rem;
    }

    .error a {
        display: inline-block;
        margin-top: 1rem;
        color: #1976d2;
        text-decoration: none;
    }

    .error a:hover {
        text-decoration: underline;
    }

    .payment-required {
        text-align: center;
        padding: 3rem 2rem;
    }

    .payment-required h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #333;
    }

    .payment-details {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: left;
    }

    .payment-details p {
        margin: 0.5rem 0;
        color: #555;
    }

    .pay-button {
        background: #1976d2;
        color: white;
        border: none;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s;
    }

    .pay-button:hover {
        background: #1565c0;
    }

    .payment-note {
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: #666;
    }

    .content-display header {
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
    }

    .content-display h1 {
        font-size: 2.5rem;
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
