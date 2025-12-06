<script lang="ts">
    import { wallet, connect, disconnect } from "$lib/stores/wallet";

    let account: any = null;

    wallet.subscribe((value) => {
        if (value) {
            account = value.accounts[0];
        } else {
            account = null;
        }
    });
</script>

<div>
    {#if account}
        <p>Connected: {account.address}</p>
        <button on:click={disconnect}>Disconnect</button>
    {:else}
        <button on:click={connect}>Connect Wallet</button>
    {/if}
</div>
