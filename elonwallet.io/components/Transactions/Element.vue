<template>
    <v-list-item class="border mx-4 my-2" @click="onClickTransaction()">
        <div class="flex gap-2 items-center">
            <img v-if="isIncoming" src="~/assets/img/arrow-down-solid.svg" class="h-7 w-7 m-1" />
            <img v-else src="~/assets/img/arrow-up-from-bracket-solid.svg" class="h-7 w-7 m-1" />
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col">
                    <span>{{ sender }}</span>
                    <span>{{ transaction.block_timestamp }}</span>
                </div>
                <span v-if="isIncoming" class="text-lg text-green-600">{{
                    `${amount} ${currentNetwork.currency}` }}</span>
                <span v-else class="text-lg text-red-600">{{
                    `- ${amount} ${currentNetwork.currency}` }}</span>
            </div>
        </div>
        <div v-if="showExtended">
            <hr class="m-2">
            <v-table>
                <tbody>
                    <tr>
                        <td>Sender</td>
                        <td>{{ transaction.from_address }}</td>
                    </tr>
                    <tr>
                        <td>Receiver</td>
                        <td>{{ transaction.to_address }}</td>
                    </tr>
                    <tr>
                        <td>Tx Hash</td>
                        <td>{{ transaction.hash }}</td>
                    </tr>
                    <tr>
                        <td>Tx Fee</td>
                        <td>{{ txFee }}</td>
                    </tr>
                    <tr>
                        <td>Gas Price</td>
                        <td>{{ gasPrice }}</td>
                    </tr>
                </tbody>
            </v-table>
            <v-btn @click="onViewBlockExplorer" variant="text" color="primary" class="mt-2">View on {{ blockExplorer
            }}</v-btn>
        </div>
    </v-list-item>
</template>

<script setup lang="ts">
import { Network, Transaction, User, Wallet } from '~/lib/types';
import { formatCurrency } from '~~/lib/UnitConverter';

const props = defineProps<{
    contacts: User[],
    transaction: Transaction,
    currentWallet: Wallet
    currentNetwork: Network
}>();

const showExtended = ref(false);

const isIncoming = computed(() => {
    return props.transaction.to_address.toLowerCase() === props.currentWallet.address.toLowerCase();
});

const sender = computed(() => {
    if (!isIncoming.value) {
        return "My Wallet";
    }

    if (props.transaction.from_address.toLowerCase() === props.currentWallet.address.toLowerCase()) {
        return "My Wallet";
    }

    if (props.transaction.from_address.toLowerCase() === "0xbc04eacb3777480b17016aff2732d7cebe18e7a8") {
        return "ElonWallet.io"
    }

    for (let contact of props.contacts) {
        if (contact.wallets.find(item => item.address.toLowerCase() === props.transaction.from_address.toLowerCase())) {
            return `${contact.name} (${contact.email})`;
        }
    }

    return props.transaction.from_address;
});

const amount = computed(() => {
    return formatCurrency(props.transaction.value, props.currentNetwork.decimals, 8);
});

const gasPrice = computed(() => {
    return `${formatCurrency(props.transaction.gas_price, props.currentNetwork.decimals / 2, 8)} Gwei`
})

const onClickTransaction = () => {
    showExtended.value = !showExtended.value;
};

const onViewBlockExplorer = (evt: Event) => {
    evt.preventDefault();
    evt.stopPropagation();
    window.open(`${props.currentNetwork.block_explorer}/tx/${props.transaction.hash}`, '_blank')?.focus();
}

const blockExplorer = computed(() => {
    const domain = new URL(props.currentNetwork.block_explorer);
    return domain.hostname;
});

const txFee = computed(() => {
    const gasPrice = parseFloat(formatCurrency(props.transaction.gas_price, props.currentNetwork.decimals)) * parseInt(props.transaction.gas);
    const extra = parseFloat(formatCurrency(props.transaction.receipt_cumulative_gas_used, props.currentNetwork.decimals)) * parseInt(props.transaction.receipt_gas_used);
    const total = gasPrice + extra

    return `${total.toFixed(8)} ${props.currentNetwork.currency}`;
})

</script>