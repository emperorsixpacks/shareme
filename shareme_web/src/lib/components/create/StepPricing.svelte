<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';
    import { toast } from '$lib/stores/toast';

    let price = 0;
    let contentType: 'article' | 'file' | null = null;

    contentStore.subscribe(data => {
        price = data.price;
        contentType = data.contentType;
    });

    function setQuickPrice(value: number) {
        price = value;
    }

    function handleNext() {
        if (price < 0) {
            toast.error('Price cannot be negative');
            return;
        }
        contentStore.setPrice(price);
        currentStep.set(contentType === 'article' ? 4 : 5);
    }

    function handleBack() {
        currentStep.set(contentType === 'article' ? 2 : 3);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Set your price</h1>
        <p class="text-gray-400">How much should people pay to access your content?</p>
    </div>

    <div class="step-content">
        <div class="pricing-card">
            <div class="input-group">
                <label for="price" class="label">Price (USDC)</label>
                <div class="price-input-wrapper">
                    <span class="currency-symbol">$</span>
                    <input
                        id="price"
                        type="number"
                        bind:value={price}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        class="price-input"
                        autofocus
                    />
                    <span class="currency-label">USDC</span>
                </div>
            </div>

            <div class="quick-prices">
                <p class="quick-label">Quick select:</p>
                <div class="price-buttons">
                    <button on:click={() => setQuickPrice(0)} class="price-btn" class:active={price === 0}>
                        Free
                    </button>
                    <button on:click={() => setQuickPrice(0.01)} class="price-btn" class:active={price === 0.01}>
                        $0.01
                    </button>
                    <button on:click={() => setQuickPrice(1)} class="price-btn" class:active={price === 1}>
                        $1
                    </button>
                    <button on:click={() => setQuickPrice(5)} class="price-btn" class:active={price === 5}>
                        $5
                    </button>
                    <button on:click={() => setQuickPrice(10)} class="price-btn" class:active={price === 10}>
                        $10
                    </button>
                    <button on:click={() => setQuickPrice(50)} class="price-btn" class:active={price === 50}>
                        $50
                    </button>
                </div>
            </div>

            <div class="earnings-preview">
                <div class="earnings-row">
                    <span class="earnings-label">Your earnings (80%):</span>
                    <span class="earnings-value">${(price * 0.8).toFixed(2)}</span>
                </div>
                <div class="earnings-row secondary">
                    <span class="earnings-label">Platform fee (20%):</span>
                    <span class="earnings-value">${(price * 0.2).toFixed(2)}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="step-actions">
        <button on:click={handleBack} class="btn-secondary">
            ← Back
        </button>
        <button on:click={handleNext} class="btn-primary">
            Continue →
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

    .pricing-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 2rem;
    }

    .input-group {
        margin-bottom: 2rem;
    }

    .label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.75rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .price-input-wrapper {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        padding: 0 1rem;
        transition: all 0.3s ease;
    }

    .price-input-wrapper:focus-within {
        border-color: rgb(147, 51, 234);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
    }

    .currency-symbol {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.25rem;
        margin-right: 0.5rem;
    }

    .price-input {
        flex: 1;
        background: transparent;
        border: none;
        padding: 1rem 0;
        font-size: 1.5rem;
        color: white;
        font-weight: 600;
    }

    .price-input:focus {
        outline: none;
    }

    .price-input::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }

    .price-input::-webkit-outer-spin-button,
    .price-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .currency-label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.875rem;
        font-weight: 500;
    }

    .quick-prices {
        margin-bottom: 2rem;
    }

    .quick-label {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 0.75rem;
    }

    .price-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
    }

    .price-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 0.625rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .price-btn:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .price-btn.active {
        background: rgba(147, 51, 234, 0.2);
        border-color: rgb(147, 51, 234);
        color: rgb(167, 139, 250);
    }

    .earnings-preview {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 0.5rem;
        padding: 1rem;
    }

    .earnings-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .earnings-row:last-child {
        margin-bottom: 0;
    }

    .earnings-row.secondary {
        opacity: 0.7;
        font-size: 0.875rem;
    }

    .earnings-label {
        color: rgba(255, 255, 255, 0.8);
    }

    .earnings-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: rgb(34, 197, 94);
    }

    .earnings-row.secondary .earnings-value {
        font-size: 1rem;
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
        background: linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119));
        color: white;
        flex: 1;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
    }
</style>
