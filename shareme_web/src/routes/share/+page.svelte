<script lang="ts">
    import RichTextEditor from "$lib/components/RichTextEditor.svelte";
    import { wallet, provider, signer } from "$lib/stores/wallet";
    import { toast } from "$lib/stores/toast";
    import { ethers } from "ethers";
    import { v4 as uuidv4 } from "uuid";

    let contentType: "write" | "upload" = "write";
    let price: number = 0.0;
    let content: string = "";
    let title: string = "";
    let isLoading = false;
    let fileInput: HTMLInputElement;
    let selectedFile: File | null = null;
    let isDragging = false;
    let fileDescription = "";

    function setContentType(type: "write" | "upload") {
        contentType = type;
    }

    function setQuickPrice(value: number) {
        price = value;
    }

    function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    }

    function validateAndSetFile(file: File) {
        // Validate file size (100MB max)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        if (file.size > maxSize) {
            toast.error('File size exceeds 100MB limit');
            return;
        }

        selectedFile = file;
        toast.success(`File "${file.name}" selected successfully!`);
        
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
            content = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(event: DragEvent) {
        event.preventDefault();
        isDragging = false;
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        isDragging = false;
        
        const file = event.dataTransfer?.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    }

    function triggerFileInput() {
        fileInput?.click();
    }

    function removeFile() {
        selectedFile = null;
        content = "";
        if (fileInput) {
            fileInput.value = "";
        }
        toast.info('File removed');
    }

    function formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    async function createSpace() {
        if (!$signer) {
            alert("Please connect your wallet first.");
            return;
        }

        isLoading = true;

        try {
            // 1. Save content to DB via API
            const response = await fetch('/api/shares', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    price,
                    contentType,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save content');
            }

            const savedContent = await response.json();
            console.log('Content saved:', savedContent);

            // 2. Create the smart contract wallet
            const factoryAddress = "0x677577fE1b811D1B989F141fC0B9eb7c1e4a924d";
            const factory = new ethers.Contract(
                factoryAddress,
                [
                    "function createWallet(bytes32 salt) public returns (address)",
                    "event WalletCreated(address indexed owner, address indexed wallet, bytes32 indexed salt)",
                ],
                $signer,
            );

                        const hex = savedContent.id.replace(/-/g, "");
            const spaceId = "0x" + hex.padEnd(64, "0");

            console.log("Creating a new space...");
            const tx = await factory.createWallet(spaceId);
            const receipt = await tx.wait();

            const walletAddress = receipt.logs[0].args[1];

            console.log(`Space created!`);
            console.log(`  Wallet address: ${walletAddress}`);
            alert(`Space created! Wallet address: ${walletAddress}`);
        } catch (error) {
            console.error("Failed to create space:", error);
            alert("Failed to create space. See console for details.");
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Create a new space</title>
</svelte:head>

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
            class:bg-white={contentType !== "write"}
            class:bg-opacity-5={contentType !== "write"}
            class:border={contentType !== "write"}
            class:border-white={contentType !== "write"}
            class:border-opacity-10={contentType !== "write"}
        >
            ✍️ Write Article
        </button>
        <button
            on:click={() => setContentType("upload")}
            class="flex-1 px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
            class:bg-purple-600={contentType === "upload"}
            class:bg-white={contentType !== "upload"}
            class:bg-opacity-5={contentType !== "upload"}
            class:border={contentType !== "upload"}
            class:border-white={contentType !== "upload"}
            class:border-opacity-10={contentType !== "upload"}
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
                bind:value={title}
            />
        </div>

        <!-- Write Content Section -->
        {#if contentType === "write"}
            <div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Content</label
                    >
                    <RichTextEditor
                        bind:content
                        placeholder="Write your content here..."
                    />
                    <p class="text-xs text-gray-500 mt-2">
                        Supports rich text formatting
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
                    
                    {#if !selectedFile}
                        <!-- File Drop Zone -->
                        <div
                            role="button"
                            tabindex="0"
                            on:click={triggerFileInput}
                            on:keydown={(e) => e.key === 'Enter' && triggerFileInput()}
                            on:dragover={handleDragOver}
                            on:dragleave={handleDragLeave}
                            on:drop={handleDrop}
                            class="border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer {isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-purple-500'}"
                        >
                            <div class="text-4xl mb-4">📤</div>
                            <p class="text-gray-400 mb-2">
                                {isDragging ? 'Drop your file here' : 'Drag & drop your file here, or click to browse'}
                            </p>
                            <p class="text-xs text-gray-500">
                                PDF, Video, Images, Code, 3D Assets - Max 100MB
                            </p>
                        </div>
                        <input 
                            type="file" 
                            class="hidden" 
                            bind:this={fileInput}
                            on:change={handleFileSelect}
                            accept="*/*"
                        />
                    {:else}
                        <!-- Selected File Preview -->
                        <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                            <div class="flex items-start justify-between">
                                <div class="flex items-start gap-4 flex-1">
                                    <div class="text-4xl">
                                        {#if selectedFile.type.startsWith('image/')}
                                            🖼️
                                        {:else if selectedFile.type.startsWith('video/')}
                                            🎥
                                        {:else if selectedFile.type.includes('pdf')}
                                            📄
                                        {:else if selectedFile.type.startsWith('audio/')}
                                            🎵
                                        {:else}
                                            📎
                                        {/if}
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-white mb-1">{selectedFile.name}</h4>
                                        <p class="text-sm text-gray-400">
                                            {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                                        </p>
                                        <div class="mt-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded inline-block">
                                            ✓ Ready to upload
                                        </div>
                                    </div>
                                </div>
                                <button
                                    on:click={removeFile}
                                    class="text-red-400 hover:text-red-300 transition p-2"
                                    title="Remove file"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Optional Description for Files -->
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2"
                        >Description (Optional)</label
                    >
                    <textarea
                        bind:value={fileDescription}
                        placeholder="Describe what buyers will get..."
                        rows="4"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition resize-none"
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
                        <span
                            class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
                            >$</span
                        >
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            class="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-purple-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            bind:value={price}
                        />
                    </div>
                    <span
                        class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center"
                        >USDC</span
                    >
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
                    <span class="text-2xl font-bold text-green-400"
                        >${(price * 0.8).toFixed(2)}</span
                    >
                </div>
            </div>
        </div>

        <!-- Create Button -->
        <button
            on:click={createSpace}
            disabled={!$signer || isLoading}
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-lg font-semibold text-lg transition shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {#if isLoading}
                Creating...
            {:else}
                Create & Get Link →
            {/if}
        </button>
    </div>
</section>
