<template>
    <div class="p-2 bg-white shadow-md rounded-md">
        <h3>Specify the transaction details</h3>
        <v-form validate-on="blur" class="mt-2" ref="transactionForm" @submit.prevent>
            <div class="flex gap-4">
                <div class="w-1/2 border">
                    <TransactionsFees />
                </div>
                <div class="w-1/2 flex flex-col gap-2">
                    <v-combobox clearable label="Contact or Address" :items="contacts?.map(item => item.email)"
                        variant="solo" v-model="addressOrContactEmail" :rules="addressOrContactEmailRules"
                        class="overflow-hidden" />
                    <v-select :disabled="!currentContact" label="Contact Wallets" variant="solo" color="primary"
                        :items="contactWalletNames" v-model="contactWalletName"
                        :rules="currentContact ? contactWalletNameRules : undefined" class="overflow-hidden" />
                    <v-text-field variant="solo" v-model="amount" :rules="amountRules" label="Amount"
                        :suffix="network!.currency" class="overflow-hidden" />
                </div>
            </div>
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="onClear">Clear</v-btn>
                <v-btn variant="text" color="primary" @click="onSend">Send</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { isAddress, parseUnits } from 'ethers';
import { formatCurrency } from '~/lib/UnitConverter';
import { isRequired, isValidNumber, isGreaterThan } from '~/lib/VuetifyValidationRules';
import { TransactionParams, UINotificationType } from '~/lib/types';
import { solveLoginChallenge } from '~/lib/webauthn';

const wallet = useCurrentWallet();
const network = useCurrentNetwork();
const { contacts } = useContacts();
const { balance } = useBalance();
const { fees } = useFees();
const { displayNotificationFromError, displayNotification } = useNotification();
const transactionForm = ref();
const emit = defineEmits<{
    (e: 'on-close'): void
}>();

const addressOrContactEmail = ref('');
const addressOrContactEmailRules = [
    (value: string) => {
        const isContactEmail = contacts.value!.find(item => item.email === value);
        const isWalletAddress = /^0x[0-9a-fA-F]{40}$/.test(value) && isAddress(value);
        if (isContactEmail || isWalletAddress)
            return true

        return 'Must be either a contact email or a wallet address'
    },
];
watch(addressOrContactEmail, () => {
    contactWalletName.value = "";

    if (addressOrContactEmail.value) {
        addressOrContactEmail.value = addressOrContactEmail.value.trim();
    }
})

const amount = ref("");
const amountRules = [
    isRequired("Amount"),
    isValidNumber("Amount"),
    isGreaterThan("Amount", 0),
    (value: number) => {
        const balanceFormatted = formatCurrency(balance.value!, network.value.decimals);
        const estimatedFeesFormatted = formatCurrency(fees.value!.estimated_fees, network.value.decimals);
        const maxAmount = parseFloat(balanceFormatted) - parseFloat(estimatedFeesFormatted)
        if (value < maxAmount)
            return true

        return 'Amount must be smaller than balance plus fees'
    }
];
watchEffect(() => {
    if (amount.value) {
        amount.value = amount.value.trim();
    }
})

const contactWalletName = ref('');
const contactWalletNameRules = [
    isRequired("Wallet Name")
];

const currentContact = computed(() => contacts.value?.find(item => item.email === addressOrContactEmail.value))
const contactWalletNames = computed(() => currentContact.value?.wallets.map(item => item.name));

const receiverAddress = computed(() => {
    if (currentContact.value && contactWalletName.value) {
        return currentContact.value!.wallets.find(item => item.name === contactWalletName.value)!.address;
    } else {
        return addressOrContactEmail.value;
    }
})

const onClear = async () => {
    transactionForm.value.reset();
}

const onSend = async () => {
    const { valid } = await transactionForm.value.validate();
    if (!valid)
        return;

    try {
        await sendTransaction()
        displayNotification("Transaction sent", "Successfully sent the transaction. Your balance and recent transactions will update soon.", UINotificationType.Success)
        transactionForm.value.reset();
        emit('on-close');
    } catch (error) {
        console.log(error)
        displayNotificationFromError(error);
    }
};

const sendTransaction = async () => {
    const enclaveApiClient = useEnclave();
    const params: TransactionParams = {
        type: "0x2",
        chainId: network.value.chain_id_hex,
        from: wallet.value!.address,
        to: receiverAddress.value,
        value: `0x${parseUnits(amount.value!, network.value.decimals).toString(16)}`,
    };
    const options = await enclaveApiClient.sendTransactionInitialize(params);
    const credential = await solveLoginChallenge(options);
    await enclaveApiClient.sendTransactionFinalize(credential);
}
</script>