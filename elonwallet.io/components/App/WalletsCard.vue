<template>
    <div class=" bg-white shadow-md rounded-md p-2">
        <div class=" flex justify-between items-center">
            <span class="font-bold">My Wallets</span>
            <DialogWalletForm />
        </div>
        <div class="flex gap-2 pt-2 mx-4">
            <v-select class="w-1/2" label="Network" variant="underlined" color="primary" :items="networkNames" chips
                v-model="currentNetworkName" />
            <v-select class="w-1/2" label="Wallet" variant="underlined" color="primary" :items="walletNames" chips
                v-model="currentWalletName" />
        </div>
    </div>
</template>

<script setup lang="ts">
const currentWallet = useCurrentWallet();
const currentNetwork = useCurrentNetwork();
const { networks } = useNetworks();
const { wallets } = useWallets();

const currentWalletName = computed({
    get() {
        return currentWallet.value.name;
    },
    set(newValue) {
        currentWallet.value = wallets.value!.find(w => w.name === newValue)!;
    }
});

const currentNetworkName = computed({
    get() {
        return currentNetwork.value.name;
    },
    set(newValue) {
        currentNetwork.value = networks.value!.find(n => n.name === newValue)!;
    }
})

const networkNames = computed(() => networks.value?.map(n => n.name))
const walletNames = computed(() => wallets.value?.map(w => w.name))
</script>