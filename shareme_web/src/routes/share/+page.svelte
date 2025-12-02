<script lang="ts">
    let contentType: "write" | "upload" = "write";
    let price: number = 0.0;

    function setContentType(type: "write" | "upload") {
        contentType = type;
    }

    function setQuickPrice(value: number) {
        price = value;
    }
</script>

<!-- Create Content Section -->
<section class="container mx-auto px-6 py-12 max-w-4xl">
    <h1 class="text-4xl font-bold mb-2">Create Content</h1>
    <p class="text-gray-400 mb-8">
        Write an article or upload a file. Set your price and get a shareable
        link.
    </p>

    <!-- Content Type Selector -->
    <div class="flex gap-4 mb-8">
        <button
            on:click={() => setContentType("write")}
            class="flex-1 px-6 py-3 rounded-lg font-medium transition"
            class:bg-purple-600={contentType === "write"}
            class:bg-gray-400={contentType !== "write"}
            class:border={contentType !== "write"}
            class:border-gray-400={contentType !== "write"}
        >
            ✍️ Write Article
        </button>
        <button
            on:click={() => setContentType("upload")}
            class="flex-1 px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
            class:bg-purple-600={contentType === "upload"}
            class:bg-gray-400={contentType !== "upload"}
            class:border={contentType !== "upload"}
            class:border-gray-400={contentType !== "upload"}
        >
            📁 Upload File
        </button>
    </div>

    <!-- Content Form -->
    <div
        class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
    >
        <!-- Title -->
        <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Title</label>
            <input
                type="text"
                placeholder="Enter your content title..."
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
            />
        </div>

        <!-- Write Content Section -->
        {#if contentType === "write"}
            <div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Content</label
                    >
                    <textarea
                        placeholder="Write your content here..."
                        rows="12"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition resize-none"
                    ></textarea>
                    <p class="text-xs text-gray-500 mt-2">
                        Supports markdown formatting
                    </p>
                </div>
            </div>
        {/if}

        <!-- Upload File Section -->
        {#if contentType === "upload"}
            <div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2"
                        >Upload File</label
                    >
                    <div
                        class="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-purple-500 transition cursor-pointer"
                    >
                        <div class="text-4xl mb-4">📤</div>
                        <p class="text-gray-400 mb-2">
                            Drag & drop your file here, or click to browse
                        </p>
                        <p class="text-xs text-gray-500">
                            PDF, Video, Images, Code, 3D Assets - Max 100MB
                        </p>
                        <input type="file" class="hidden" />
                    </div>
                </div>

                <!-- Optional Description for Files -->
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2"
                        >Description (Optional)</label
                    >
                    <textarea
                        placeholder="Describe what buyers will get..."
                        rows="4"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-500 transition resize-none"
                    ></textarea>
                </div>
            </div>
        {/if}

        <!-- Pricing Section -->
        <div class="border-t border-white/10 pt-6 mt-6">
            <h3 class="text-lg font-semibold mb-4">Pricing</h3>

            <div class="mb-6">
                <label class="block text-sm font-medium mb-2"
                    >Set Your Price</label
                >
                <div class="flex gap-4">
                    <div class="flex-1 relative">
                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            class="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-purple-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            bind:value={price}
                        />
                    </div>
                    <span class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center">USDC</span>
                </div>
                <div class="flex gap-2 mt-2">
                    <button
                        on:click={() => setQuickPrice(1)}
                        class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition"
                        >$1</button
                    >
                    <button
                        on:click={() => setQuickPrice(0.01)}
                        class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition"
                        >$0.01</button
                    >
                    <button
                        on:click={() => setQuickPrice(10)}
                        class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition"
                        >$10</button
                    >
                    <button
                        on:click={() => setQuickPrice(50)}
                        class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition"
                        >$50</button
                    >
                </div>
                <p class="text-xs text-gray-500 mt-2">
                    You'll receive 80% • Platform keeps 20%
                </p>
            </div>

            <!-- Optional: Add to Bundle -->
            <div
                class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6"
            >
                <label class="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        class="mr-3 w-5 h-5 accent-purple-600"
                    />
                    <div>
                        <div class="font-medium">
                            Add to Subscription Bundle
                        </div>
                        <div class="text-sm text-gray-400">
                            Let users subscribe monthly to access this content
                        </div>
                    </div>
                </label>
            </div>

            <!-- Earnings Preview -->
            <div
                class="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
            >
                <div class="flex justify-between items-center">
                    <span class="text-gray-400">Your earnings per sale:</span>
                    <span class="text-2xl font-bold text-green-400">${(price * 0.8).toFixed(2)}</span>
                </div>
            </div>
        </div>

        <!-- Create Button -->
        <button
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-lg font-semibold text-lg transition shadow-lg mt-6"
        >
            Create & Get Link →
        </button>
    </div>
</section>