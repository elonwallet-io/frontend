<template>
    <div class="p-2 bg-white shadow-md rounded-md">
        <div class="flex justify-between">
            <span class="font-bold">My Balance</span>
            <span v-if="currentWallet" class="text-gray-500">Address: {{ currentWallet.address }}</span>
        </div>
        <div class="mt-4">
            <p><span v-if="currentNetwork && balance" class="text-3xl font-bold">{{ formatCurrency(balance,
                currentNetwork.decimals) }} {{
        currentNetwork.currency
    }}</span>
                available</p>
        </div>
        <v-btn class="mt-4" variant="outlined" color="primary" @click="$emit('on-transaction')">Send Transaction</v-btn>
    </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~~/lib/UnitConverter';
const currentNetwork = useCurrentNetwork();
const currentWallet = useCurrentWallet();
const { balance, refresh } = useBalance();
defineEmits(['on-transaction'])

watch([currentNetwork, currentWallet], async () => {
    await refresh();
})

let interval: number;

onMounted(async () => {
    interval = window.setInterval(async () => {
        await refresh();
    }, 120000,);
})

onUnmounted(async () => {
    window.clearInterval(interval);
})
</script>