<script lang="ts">
    import ConnectWallet from "$lib/components/ConnectWallet.svelte";
    export let isViewPage: boolean = false;
</script>

<nav
    class="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center"
>
    <a
        href="/"
        class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
    >
        ShareMe
    </a>
    {#if !isViewPage}
        <ConnectWallet />
    {/if}
</nav>
