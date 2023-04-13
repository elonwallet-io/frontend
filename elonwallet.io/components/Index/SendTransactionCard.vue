<template>
    <div class="p-2 bg-white shadow-md rounded-md">
        <h3>Specify the transaction details</h3>
        <v-form class="mt-2" ref="transactionForm" @submit.prevent>
            <div class="flex gap-4">
                <div class="w-1/2 border">
                    <TransactionsFees />
                </div>
                <div class="w-1/2">
                    <v-combobox clearable label="Contact or Address" :items="contacts?.map(item => item.email)"
                        variant="solo" v-model="addressOrContactEmail" :rules="addressOrContactEmailRules"
                        class="overflow-hidden" />
                    <v-select :disabled="!currentContact" label="Contact Wallets" variant="solo" color="primary"
                        :items="contactWalletNames" v-model="contactWalletName"
                        :rules="currentContact ? contactWalletNameRules : undefined" />
                    <v-text-field variant="solo" v-model="amount" :rules="amountRules" label="Amount"
                        :suffix="network!.currency" />
                </div>
            </div>
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
                <v-btn variant="text" color="primary" @click="onSend">Send</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { HttpError } from '~/lib/HttpError';
import { toWei, fromWei } from '~/lib/UnitConverter';
import { UINotificationType } from '~/lib/types';
import { solveLoginChallenge } from '~/lib/webauthn';

const wallet = useCurrentWallet();
const network = useCurrentNetwork();
const { contacts } = useContacts();
const enclaveApiClient = useEnclave();
const { balance } = useBalance();
const { fees } = useFees();
const { displayNetworkErrorNotification, displayNotificationFromHttpError, displayNotification } = useNotification();
const transactionForm = ref();
const emit = defineEmits(['on-close'])

const addressOrContactEmail = ref('');
const addressOrContactEmailRules = [
    (value: string) => {
        const isContactEmail = contacts.value!.find(item => item.email === value);
        const isWalletAddress = /^0x[0-9a-fA-F]{40}$/.test(value);
        if (isContactEmail || isWalletAddress)
            return true

        return 'Must be either a contact email or a wallet address'
    },
];

const amount = ref<number>();
const amountRules = [
    (value: any) => {
        if (!isNaN(value))
            return true

        return 'Amount must be a valid number.'
    },
    (value: number) => {
        if (value) return true

        return 'Amount is required.'
    },
    (value: number) => {
        if (value > 0) return true

        return 'Amount must be greater than 0'
    },
    (value: number) => {
        const maxAmount = parseFloat(fromWei(balance.value!, network.value!.decimals)) - parseFloat(fromWei(fees.value!.estimated_fees, network.value!.decimals))
        if (value < maxAmount) return true

        return 'Amount must be smaller than balance plus fees'
    }
];

const contactWalletName = ref('');
const contactWalletNameRules = [
    (value: string) => {
        if (value) {
            return true
        }

        return 'Wallet Name is required.'
    }
];

const currentContact = computed(() => {
    return contacts.value?.find(item => item.email === addressOrContactEmail.value);
})

const contactWalletNames = computed(() => {
    return currentContact.value?.wallets.map(item => item.name);
});

watch(addressOrContactEmail, () => {
    if (contactWalletName.value) {
        contactWalletName.value = "";
    }
})

const receiverAddress = computed(() => {
    if (currentContact.value && contactWalletName.value) {
        return currentContact.value!.wallets.find(item => item.name === contactWalletName.value)!.address;
    } else {
        return addressOrContactEmail.value;
    }
})


const onDiscard = async () => {
    transactionForm.value.reset();
    emit('on-close');
}

const onSend = async () => {
    const { valid } = await transactionForm.value.validate();
    if (valid) {
        if (await sendTransaction()) {
            transactionForm.value.reset();
            emit('on-close');
        }
    }
};

const sendTransaction = async () => {
    try {
        const options = await enclaveApiClient.transactionInitialize();
        const credential = await solveLoginChallenge(options);
        await enclaveApiClient.transactionFinalize({
            assertion_response: credential,
            transaction_info: {
                amount: toWei(amount.value!.toString()),
                chain: network.value!.chain,
                from: wallet.value!.address,
                to: receiverAddress.value
            }
        });
        displayNotification("Transaction sent", "Successfully sent the transaction. Your balance and recent transactions will update soon.", UINotificationType.Success)
        return true;
    }
    catch (error) {
        if (error instanceof HttpError) {
            displayNotificationFromHttpError(error);
        } else {
            displayNetworkErrorNotification();
        }
        return false;
    }
}
</script>