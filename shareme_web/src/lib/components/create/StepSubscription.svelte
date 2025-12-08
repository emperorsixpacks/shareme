<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';

    let enableSubscription = false;
    let minAmount = 0;
    let maxAmount = 0;
    let contentType: 'article' | 'file' | null = null;

    contentStore.subscribe(data => {
        enableSubscription = data.enableSubscription;
        minAmount = data.minAmount;
        maxAmount = data.maxAmount;
        contentType = data.contentType;
    });

    function handleNext() {
        contentStore.setSubscription(enableSubscription);
        contentStore.setAmountRange(minAmount, maxAmount);
        currentStep.set(contentType === 'article' ? 5 : 6);
    }

    function handleBack() {
        currentStep.set(contentType === 'article' ? 3 : 4);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Subscription options</h1>
        <p class="text-gray-400">Allow subscribers to access your content (Optional)</p>
    </div>

    <div class="step-content">
        <div class="subscription-card">
            <label class="checkbox-label">
                <input type="checkbox" bind:checked={enableSubscription} class="checkbox" />
                <div>
                    <div class="checkbox-title">Enable subscription access</div>
                    <div class="checkbox-desc">Let users subscribe monthly to access this content</div>
                </div>
            </label>

            {#if enableSubscription}
                <div class="range-inputs">
                    <div class="input-group">
                        <label for="min" class="label">Minimum amount ($)</label>
                        <input id="min" type="number" bind:value={minAmount} min="0" step="0.01" class="input-field" />
                    </div>
                    <div class="input-group">
                        <label for="max" class="label">Maximum amount ($)</label>
                        <input id="max" type="number" bind:value={maxAmount} min="0" step="0.01" class="input-field" />
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <div class="step-actions">
        <button on:click={handleBack} class="btn-secondary">← Back</button>
        <button on:click={handleNext} class="btn-primary">Continue →</button>
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
    .subscription-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 2rem;
    }
    .checkbox-label {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        margin-bottom: 1.5rem;
    }
    .checkbox {
        width: 1.25rem;
        height: 1.25rem;
        accent-color: rgb(147, 51, 234);
        cursor: pointer;
    }
    .checkbox-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    .checkbox-desc {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
    }
    .range-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .input-group {
        margin-bottom: 0;
    }
    .label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: rgba(255, 255, 255, 0.9);
    }
    .input-field {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        padding: 0.75rem;
        color: white;
        transition: all 0.3s ease;
    }
    .input-field:focus {
        outline: none;
        border-color: rgb(147, 51, 234);
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
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
