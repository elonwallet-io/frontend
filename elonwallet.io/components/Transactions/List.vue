<template>
    <v-list :lines="false">
        <v-list-item v-for="transaction in transactions" :key="transaction.block_timestamp" class="border mx-4 my-2"
            @click="onClickTransaction(transaction)">
            <div class="flex gap-2 items-center">
                <img v-if="isIncomingTransaction(transaction)" src="~/assets/img/arrow-down-solid.svg"
                    class="h-7 w-7 m-1" />
                <img v-else src="~/assets/img/arrow-up-from-bracket-solid.svg" class="h-7 w-7 m-1" />
                <div class="flex justify-between items-center w-full">
                    <div class="flex flex-col">
                        <span>{{ transactionSender(transaction) }}</span>
                        <span>{{ transaction.block_timestamp }}</span>
                    </div>
                    <span v-if="isIncomingTransaction(transaction)" class="text-lg text-green-600">{{
                        `${fromWei(transaction.value)} ${currentNetwork!.currency}` }}</span>
                    <span v-else class="text-lg text-red-600">{{
                        `- ${fromWei(transaction.value)} ${currentNetwork!.currency}` }}</span>
                </div>
            </div>
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { Transaction } from '~~/lib/types';
import { fromWei } from '~~/lib/UnitConverter';

const { backendApiClient } = useApi();
const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

const currentNetwork = useCurrentNetwork();
const currentWallet = useCurrentWallet();
const { contacts } = useContacts();

const { data: transactions, error, refresh } = useLazyAsyncData<Transaction[]>('transactions', async () => {
    const resp = await backendApiClient.getTransactions(currentWallet.value!.address, currentNetwork.value!.chain, "")
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

let interval = 0;

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

const onClickTransaction = (transaction: Transaction) => {
    window.open(`${currentNetwork.value!.block_explorer}${transaction.hash}`, '_blank')?.focus();
};

const isIncomingTransaction = (transaction: Transaction) => {
    return transaction.to_address.toLowerCase() === currentWallet.value?.address.toLowerCase();
}

const transactionSender = (transaction: Transaction) => {
    for (let contact of contacts.value ?? []) {
        if (!!contact.wallets.find(item => item.address.toLowerCase() === transaction.from_address.toLowerCase())) {
            return `${contact.name} (${contact.email})`;
        }
    }

    return transaction.from_address;
}

</script>