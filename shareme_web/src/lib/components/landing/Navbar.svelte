<script lang="ts">
	import ConnectWallet from '$lib/components/ConnectWallet.svelte';
</script>

<nav class="container mx-auto px-6 py-6 flex justify-between items-center">
	<a
		href="/"
		class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
	>
		ShareMe
	</a>
	<ConnectWallet />
</nav>