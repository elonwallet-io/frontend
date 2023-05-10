<template>
    <v-list :lines="false">
        <TransactionsElement v-for="transaction in pagedTransactions" :key="transaction.block_timestamp"
            :contacts="contacts ?? []" :current-network="currentNetwork!" :current-wallet="currentWallet!"
            :transaction="transaction" />
    </v-list>
    <v-pagination v-if="length" :length="length" variant="text" v-model="page" />
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { Transaction } from '~~/lib/types';

const backendJWT = useBackendJWT();
const backendApiClient = useBackend();
const { displayNotificationFromError } = useNotification();

const currentNetwork = useCurrentNetwork();
const currentWallet = useCurrentWallet();
const { contacts } = useContacts();

const stepSize = 10;
const page = ref(1);

const { data: transactions, error: transactionsError, refresh } = useAsyncDataWithCache<Transaction[]>('transactions', async () => {
    const resp = await backendApiClient.getTransactions(currentWallet.value.address, currentNetwork.value.chain_id_hex, backendJWT.value)
    //const resp = await backendApiClient.getTransactions("0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97", currentNetwork.value.chain_id_hex, backendJWT.value)
    return resp.transactions;
})

watch(transactionsError, () => {
    if (transactionsError.value) {
        displayNotificationFromError(transactionsError.value);
        if (transactionsError.value instanceof HttpError && transactionsError.value.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
})

const pagedTransactions = computed(() => {
    const start = (page.value - 1) * stepSize;
    return transactions.value?.slice(start, start + stepSize) ?? []
})

const length = computed(() => Math.ceil((transactions.value?.length ?? 0) / stepSize))

let interval: number;

onMounted(async () => {
    interval = window.setInterval(async () => {
        await refresh();
    }, 120000,);
})

onUnmounted(async () => {
    window.clearInterval(interval);
})

watch([currentNetwork, currentWallet], async () => {
    await refresh();
})
</script>