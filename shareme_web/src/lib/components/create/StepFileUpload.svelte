<script lang="ts">
    import { contentStore, currentStep } from "$lib/stores/createContent";
    import { toast } from "$lib/stores/toast";

    let fileInput: HTMLInputElement;
    let selectedFile: File | null = null;
    let isDragging = false;
    let isUploading = false;
    let uploadProgress = 0;
    let fileUrl = "";

    contentStore.subscribe((data) => {
        selectedFile = data.file;
        fileUrl = data.fileUrl;
    });

    function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    }

    function validateAndSetFile(file: File) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            toast.error("File size exceeds 100MB limit");
            return;
        }

        selectedFile = file;
        uploadFile(file);
    }

    async function uploadFile(file: File) {
        const formData = new FormData();
        formData.append("file", file);

        isUploading = true;
        uploadProgress = 0;

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
                uploadProgress = Math.round((event.loaded / event.total) * 100);
            }
        });

        xhr.addEventListener("load", () => {
            isUploading = false;
            if (xhr.status === 201) {
                const result = JSON.parse(xhr.responseText);
                contentStore.setFile(file, result.url);
                toast.success(`File "${file.name}" uploaded!`);
            } else {
                toast.error("File upload failed");
                console.error(xhr.responseText);
                removeFile();
            }
        });

        xhr.addEventListener("error", () => {
            isUploading = false;
            toast.error("File upload failed");
            console.error("An error occurred during the upload");
            removeFile();
        });

        xhr.open("POST", "/api/upload", true);
        xhr.send(formData);
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
        contentStore.setFile(null, "");
        if (fileInput) {
            fileInput.value = "";
        }
        uploadProgress = 0;
        isUploading = false;
    }

    function formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
        );
    }

    function handleNext() {
        if (!selectedFile || !fileUrl) {
            toast.error("Please select and upload a file");
            return;
        }
        currentStep.set(3);
    }

    function handleBack() {
        currentStep.set(1);
    }
</script>

<div class="step-container">
    <div class="step-header">
        <h1 class="text-3xl font-bold mb-2">Upload your file</h1>
        <p class="text-gray-400">Share any digital asset with your audience</p>
    </div>

    <div class="step-content">
        {#if !selectedFile}
            <div
                role="button"
                tabindex="0"
                on:click={triggerFileInput}
                on:keydown={(e) => e.key === "Enter" && triggerFileInput()}
                on:dragover={handleDragOver}
                on:dragleave={handleDragLeave}
                on:drop={handleDrop}
                class="drop-zone"
                class:dragging={isDragging}
            >
                <div class="upload-icon">📤</div>
                <p class="upload-text">
                    {isDragging
                        ? "Drop your file here"
                        : "Drag & drop your file here"}
                </p>
                <p class="upload-subtext">or click to browse</p>
                <p class="upload-hint">
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
            <div class="file-preview">
                <div class="file-icon">
                    {#if selectedFile.type.startsWith("image/")}
                        🖼️
                    {:else if selectedFile.type.startsWith("video/")}
                        🎥
                    {:else if selectedFile.type.includes("pdf")}
                        📄
                    {:else if selectedFile.type.startsWith("audio/")}
                        🎵
                    {:else}
                        📎
                    {/if}
                </div>
                <div class="file-info">
                    <h4 class="file-name">{selectedFile.name}</h4>
                    <p class="file-meta">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type ||
                            "Unknown type"}
                    </p>
                    {#if isUploading}
                        <div class="progress-bar-container">
                            <div
                                class="progress-bar-fill"
                                style="width: {uploadProgress}%"
                            ></div>
                        </div>
                        <div class="file-status">
                            Uploading...
                        </div>
                    {:else if fileUrl}
                        <div class="file-status success">✓ Upload complete</div>
                    {:else}
                        <div class="file-status">Waiting to upload...</div>
                    {/if}
                </div>
                <button
                    on:click={removeFile}
                    class="remove-btn"
                    title="Remove file"
                    disabled={isUploading}
                >
                    ✕
                </button>
            </div>
        {/if}
    </div>

    <div class="step-actions">
        <button
            on:click={handleBack}
            class="btn-secondary"
            disabled={isUploading}
        >
            ← Back
        </button>
        <button
            on:click={handleNext}
            class="btn-primary"
            disabled={!fileUrl || isUploading}
        >
            {#if isUploading}
                <div class="spinner"></div>
                <span>Uploading...</span>
            {:else}
                <span>Continue →</span>
            {/if}
        </button>
    </div>
</div>

<style>
    .step-container {
        max-width: 700px;
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

    .drop-zone {
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 1rem;
        padding: 4rem 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.02);
    }

    .drop-zone:hover,
    .drop-zone.dragging {
        border-color: rgb(147, 51, 234);
        background: rgba(147, 51, 234, 0.1);
    }

    .upload-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .upload-text {
        font-size: 1.125rem;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 0.5rem;
    }

    .upload-subtext {
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 1rem;
    }

    .upload-hint {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.5);
    }

    .file-preview {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .file-icon {
        font-size: 3rem;
    }

    .file-info {
        flex: 1;
    }

    .file-name {
        font-weight: 600;
        color: white;
        margin-bottom: 0.5rem;
    }

    .file-meta {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 0.5rem;
    }

    .file-status {
        display: inline-block;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.75rem;
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
    }

    .file-status.success {
        background: rgba(34, 197, 94, 0.2);
        color: rgb(34, 197, 94);
    }

    .progress-bar-container {
        height: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .progress-bar-fill {
        height: 100%;
        background: linear-gradient(
            to right,
            rgb(147, 51, 234),
            rgb(219, 39, 119)
        );
        transition: width 0.3s ease;
        border-radius: 1rem;
    }

    .remove-btn {
        background: rgba(239, 68, 68, 0.1);
        color: rgb(239, 68, 68);
        border: none;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1.25rem;
    }

    .remove-btn:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.2);
    }

    .remove-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .hidden {
        display: none;
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
        background: linear-gradient(
            to right,
            rgb(147, 51, 234),
            rgb(219, 39, 119)
        );
        color: white;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
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

    .spinner {
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        width: 1.2em;
        height: 1.2em;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
