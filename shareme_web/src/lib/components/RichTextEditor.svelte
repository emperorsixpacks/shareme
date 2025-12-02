<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import { browser } from "$app/environment";

    export let content: string = "";
    export let placeholder: string = "Start writing...";

    let element: HTMLElement;
    let editor: Editor;

    onMount(() => {
        if (browser && element) {
            editor = new Editor({
                element: element,
                extensions: [StarterKit],
                content: content,
                editorProps: {
                    attributes: {
                        class: "prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4",
                    },
                },
                onTransaction: () => {
                    content = editor.getHTML();
                },
            });
        }
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });

    $: if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
    }
</script>

<div
    class="tiptap-wrapper bg-white/5 border border-white/10 rounded-lg focus-within:border-purple-500 transition"
>
    <!-- Toolbar -->
    {#if browser && editor}
        <div class="flex flex-wrap gap-1 p-2 border-b border-white/10">
            <button
                on:click={() => editor.chain().focus().toggleBold().run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("bold")}
                type="button"
            >
                <strong>B</strong>
            </button>
            <button
                on:click={() => editor.chain().focus().toggleItalic().run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("italic")}
                type="button"
            >
                <em>I</em>
            </button>
            <button
                on:click={() => editor.chain().focus().toggleStrike().run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("strike")}
                type="button"
            >
                <del>S</del>
            </button>
            <button
                on:click={() => editor.chain().focus().toggleCode().run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("code")}
                type="button"
            >
                &lt;/&gt;
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("heading", { level: 1 })}
                type="button"
            >
                H1
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("heading", { level: 2 })}
                type="button"
            >
                H2
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("heading", { level: 3 })}
                type="button"
            >
                H3
            </button>
            <button
                on:click={() => editor.chain().focus().toggleBulletList().run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("bulletList")}
                type="button"
            >
                • List
            </button>
            <button
                on:click={() => editor.chain().focus().toggleBlockquote().run()}
                class="px-3 py-1 rounded hover:bg-white/10 transition"
                class:bg-white={editor.isActive("blockquote")}
                type="button"
            >
                " Quote
            </button>
        </div>
    {/if}

    <!-- Editor -->
    <div bind:this={element} class="text-white"></div>
</div>

<style>
    :global(.tiptap p.is-editor-empty:first-child::before) {
        color: #adb5bd;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }

    :global(.tiptap p) {
        margin: 0.5rem 0;
    }

    :global(.tiptap h2) {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 1rem 0 0.5rem;
    }

    :global(.tiptap ul) {
        padding-left: 1.5rem;
        list-style: disc;
    }

    :global(.tiptap strong) {
        font-weight: bold;
    }

    :global(.tiptap em) {
        font-style: italic;
    }
</style>