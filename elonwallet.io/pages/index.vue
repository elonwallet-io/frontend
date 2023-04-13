<template>
    <div v-if="ready" class="w-9/12 flex gap-4 m-auto mt-4">
        <div class="w-8/12 flex flex-col gap-4">
            <IndexBalanceCard @on-transaction="showSendTransaction = !showSendTransaction" />
            <IndexSendTransactionCard v-if="showSendTransaction" @on-close="showSendTransaction = false" />
            <IndexTransactionCard />
        </div>
        <div class="w-4/12 flex flex-col gap-4">
            <IndexWalletsCard />
            <IndexContactsCard />
        </div>
    </div>
</template>

<script setup lang="ts">
const wallet = useCurrentWallet();
const network = useCurrentNetwork();
const { wallets } = useWallets();
const { networks } = useNetworks();
const showSendTransaction = ref(false);

watch(networks, () => {
    if (networks.value)
        network.value = networks.value[0]!;
});

watch(wallets, () => {
    if (wallets.value)
        wallet.value = wallets.value[0]!;
});

const ready = computed(() => {
    return wallets.value && wallet.value && networks.value && network.value
})
</script>