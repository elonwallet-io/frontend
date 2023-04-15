<template>
    <div class=" bg-white shadow-md rounded-md p-2">
        <div class=" flex justify-between items-center">
            <span class="font-bold">My Wallets</span>
            <DialogWalletForm />
        </div>
        <div class="flex gap-2 pt-2 mx-4">
            <v-select class="w-1/2" label="Network" variant="solo" color="primary" :items="networks!.map(item => item.name)"
                v-model="networkName" />
            <v-select class="w-1/2" label="Wallet" variant="solo" color="primary" :items="wallets!.map(item => item.name)"
                v-model="walletName" />
        </div>
    </div>
</template>

<script setup lang="ts">
const currentWallet = useCurrentWallet();
const currentNetwork = useCurrentNetwork();
const { networks } = useNetworks();
const { wallets } = useWallets();

const walletName = ref(currentWallet.value!.name);
const networkName = ref(currentNetwork.value!.name);

watch(currentWallet, () => {
    if (currentWallet.value)
        walletName.value = currentWallet.value.name
});

watch(currentNetwork, () => {
    if (currentNetwork.value)
        networkName.value = currentNetwork.value.name
});

watch(walletName, () => {
    currentWallet.value = wallets.value!.find((w) => w.name === walletName.value)!;
});

watch(networkName, () => {
    currentNetwork.value = (networks.value!.find((n) => n.name === networkName.value))!;
});
</script>