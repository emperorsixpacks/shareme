<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";

    import Navbar from "$lib/components/landing/Navbar.svelte";
    import Footer from "$lib/components/landing/Footer.svelte";
    import Toast from "$lib/components/Toast.svelte";
    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<Toast />

<section
    class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white"
>
    <Navbar />

    {@render children()}
    <Footer />
</section>
