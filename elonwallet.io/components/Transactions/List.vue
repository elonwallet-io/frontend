<template>
    <v-list :lines="false">
        <TransactionsElement v-for="transaction in pagedTransactions" :key="transaction.block_timestamp"
            :contacts="contacts ?? []" :current-network="currentNetwork!" :current-wallet="currentWallet!"
            :transaction="transaction" />
    </v-list>
    <v-pagination v-if="transactions?.length" :length="length" variant="text" v-model="page" />
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { Transaction } from '~~/lib/types';

const backendJWT = useBackendJWT();
const backendApiClient = useBackend();
const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

const currentNetwork = useCurrentNetwork();
const currentWallet = useCurrentWallet();
const { contacts } = useContacts();

const stepSize = 10;
const page = ref(1);

const { data: transactions, error, refresh } = useAsyncDataWithCache<Transaction[]>('transactions', async () => {
    //const resp = await backendApiClient.getTransactions(currentWallet.value!.address, currentNetwork.value.chain, backendJWT.value)
    const resp = await backendApiClient.getTransactions("0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97", currentNetwork.value.chain, backendJWT.value)
    return resp.transactions;
})

watch(error, () => {
    if (error.value) {
        if (error.value instanceof HttpError) {
            displayNotificationFromHttpError(error.value);
            if (error.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        } else {
            displayNetworkErrorNotification();
        }
    }
})

const pagedTransactions = computed(() => {
    const start = (page.value - 1) * stepSize;
    return transactions.value?.slice(start, start + stepSize) ?? []
})

const length = computed(() => {
    return Math.ceil((transactions.value?.length ?? 0) / stepSize)
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

watch(currentNetwork, async () => {
    if (currentNetwork.value && currentWallet.value)
        await refresh();
})

watch(currentWallet, async () => {
    if (currentNetwork.value && currentWallet.value)
        await refresh();
})
</script>