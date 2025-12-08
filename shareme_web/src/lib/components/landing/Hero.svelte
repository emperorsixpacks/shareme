<script>
    import { goto } from "$app/navigation";

    let isLoading = false;

    function startCreating() {
        isLoading = true;
        setTimeout(() => {
            goto("/share");
        });
        isLoading = false;
    }
</script>

{#if !isLoading}
    <div class="container mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Monetize Your Content<br />
            <span
                class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
                Instantly
            </span>
        </h1>

        <p class="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Share content behind paywalls. Get paid in seconds. Keep 80% of
            every sale.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold text-base transition shadow-lg"
                on:click={startCreating}
            >
                Start Creating →
            </button>
            <button
                class="border-2 border-purple-400 hover:bg-purple-400/10 px-6 py-3 rounded-lg font-semibold text-base transition"
            >
                Learn More
            </button>
        </div>
    </div>
{:else}
    <div class="container mx-auto px-6 py-12 max-w-4xl animate-pulse">
        <!-- Title and Description Placeholders -->
        <div class="h-10 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div class="h-6 bg-gray-700 rounded w-full mb-8"></div>

        <!-- Content Type Selector Placeholders -->
        <div class="flex gap-4 mb-8">
            <div class="flex-1 h-12 bg-gray-700 rounded-lg"></div>
            <div class="flex-1 h-12 bg-gray-700 rounded-lg"></div>
        </div>

        <!-- Content Form Placeholder -->
        <div
            class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
        >
            <!-- Title Input Placeholder -->
            <div class="mb-6">
                <div class="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div class="h-12 bg-gray-700 rounded-lg"></div>
            </div>

            <!-- Content Textarea Placeholder -->
            <div class="mb-6">
                <div class="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div class="h-48 bg-gray-700 rounded-lg"></div>
            </div>

            <!-- Pricing Section Placeholders -->
            <div class="border-t border-white/10 pt-6 mt-6">
                <div class="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>

                <div class="mb-6">
                    <div class="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div class="flex gap-4">
                        <div class="flex-1 h-12 bg-gray-700 rounded-lg"></div>
                        <div class="h-12 bg-gray-700 rounded-lg w-24"></div>
                    </div>
                </div>

                <!-- Add to Bundle Placeholder -->
                <div
                    class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6"
                >
                    <div class="flex items-center">
                        <div class="h-5 w-5 bg-gray-700 rounded mr-3"></div>
                        <div>
                            <div
                                class="h-4 bg-gray-700 rounded w-40 mb-1"
                            ></div>
                            <div class="h-3 bg-gray-700 rounded w-60"></div>
                        </div>
                    </div>
                </div>

                <!-- Earnings Preview Placeholder -->
                <div
                    class="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
                >
                    <div class="flex justify-between items-center">
                        <div class="h-4 bg-gray-700 rounded w-1/3"></div>
                        <div class="h-8 bg-gray-700 rounded w-1/4"></div>
                    </div>
                </div>
            </div>

            <!-- Create Button Placeholder -->
            <div class="w-full h-16 bg-gray-700 rounded-lg mt-6"></div>
        </div>
    </div>
{/if}
