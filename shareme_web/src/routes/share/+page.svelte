<script lang="ts">
    import { contentStore, currentStep } from '$lib/stores/createContent';
    import { onDestroy } from 'svelte';
    
    // Import all step components
    import StepChooseType from '$lib/components/create/StepChooseType.svelte';
    import StepTitle from '$lib/components/create/StepTitle.svelte';
    import StepArticleContent from '$lib/components/create/StepArticleContent.svelte';
    import StepFileUpload from '$lib/components/create/StepFileUpload.svelte';
    import StepDescription from '$lib/components/create/StepDescription.svelte';
    import StepPricing from '$lib/components/create/StepPricing.svelte';
    import StepSubscription from '$lib/components/create/StepSubscription.svelte';
    import StepReview from '$lib/components/create/StepReview.svelte';

    let step = 0;
    let contentType: 'article' | 'file' | null = null;

    const unsubscribeStep = currentStep.subscribe(value => {
        step = value;
    });

    const unsubscribeContent = contentStore.subscribe(data => {
        contentType = data.contentType;
    });

    onDestroy(() => {
        unsubscribeStep();
        unsubscribeContent();
    });

    // Article flow: 0 (choose) → 1 (title) → 2 (content) → 3 (pricing) → 4 (subscription) → 5 (review)
    // File flow: 0 (choose) → 1 (title) → 2 (upload) → 3 (description) → 4 (pricing) → 5 (subscription) → 6 (review)
    
    $: totalSteps = contentType === 'article' ? 6 : 7;
    $: progress = step > 0 ? ((step / (totalSteps - 1)) * 100) : 0;
</script>

<svelte:head>
    <title>Create Content - ShareMe</title>
</svelte:head>

<div class="page-container">
    <!-- Progress Bar -->
    {#if step > 0}
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: {progress}%"></div>
            </div>
            <p class="progress-text">Step {step} of {totalSteps - 1}</p>
        </div>
    {/if}

    <!-- Step Content -->
    <div class="step-wrapper">
        {#if step === 0}
            <StepChooseType />
        {:else if step === 1}
            <StepTitle />
        {:else if step === 2}
            {#if contentType === 'article'}
                <StepArticleContent />
            {:else}
                <StepFileUpload />
            {/if}
        {:else if step === 3}
            {#if contentType === 'article'}
                <StepPricing />
            {:else}
                <StepDescription />
            {/if}
        {:else if step === 4}
            {#if contentType === 'article'}
                <StepSubscription />
            {:else}
                <StepPricing />
            {/if}
        {:else if step === 5}
            {#if contentType === 'article'}
                <StepReview />
            {:else}
                <StepSubscription />
            {/if}
        {:else if step === 6}
            <StepReview />
        {/if}
    </div>
</div>

<style>
    .page-container {
        min-height: 100vh;
        padding: 2rem 0;
    }

    .progress-container {
        max-width: 600px;
        margin: 0 auto 2rem;
        padding: 0 1rem;
    }

    .progress-bar {
        width: 100%;
        height: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119));
        transition: width 0.3s ease;
        border-radius: 1rem;
    }

    .progress-text {
        text-align: center;
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .step-wrapper {
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
