<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";

    import Navbar from "$lib/components/landing/Navbar.svelte";
    import Footer from "$lib/components/landing/Footer.svelte";
    import Toast from "$lib/components/Toast.svelte";
    let { children } = $props();

    let isViewPage = $derived(page.url.pathname.startsWith("/view/"));
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<Toast />

<section
    class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white"
>
    <Navbar {isViewPage} />

    {@render children()}
    <Footer />
</section>
