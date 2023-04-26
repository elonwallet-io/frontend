<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <template v-slot:activator="{ props }">
                <v-btn variant="text" color="primary" v-bind="props">
                    + Add Wallet
                </v-btn>
            </template>
            <div class="p-4 flex flex-col gap-4 w-2/6 bg-white m-auto">
                <span class="text-xl">Add a new wallet</span>
                <v-form ref="walletForm" @submit.prevent>
                    <v-text-field variant="solo" v-model="walletName" :rules="walletNameRules" label="Wallet name" />
                    <v-switch color="primary" v-model="walletVisibility" label="Allow contacts to see this wallet?" />
                    <div class="flex justify-end">
                        <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
                        <v-btn variant="text" color="primary" @click="onSave">Save</v-btn>
                    </div>
                </v-form>
            </div>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { isAlphaNumeric, isRequired, isUnique } from '~/lib/VuetifyValidationRules';
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { UINotificationType } from '~~/lib/types';

const backendApiClient = useBackend();
const { displayNotification, displayNotificationFromError } = useNotification();
const { wallets, refresh } = useWallets();
const dialog = ref(false);
const walletForm = ref();
const walletName = ref("");
const walletNames = computed(() => {
    return wallets.value?.map(item => item.name) ?? [];
})
const walletNameRules = [
    isRequired("Wallet Name"),
    isAlphaNumeric("Wallet Name"),
    isUnique("Wallet Name", walletNames)
];
const walletVisibility = ref(false);

const onDiscard = async () => {
    walletForm.value.reset();
    dialog.value = false;
}

const onSave = async () => {
    const { valid } = await walletForm.value.validate();
    if (!valid)
        return;

    try {
        await createWallet(walletName.value, walletVisibility.value);
        dialog.value = false;
        walletForm.value.reset();
        displayNotification("Wallet created", `Wallet ${name} has been created successfully`, UINotificationType.Success);
    } catch (error) {
        displayNotificationFromError(error);
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
};

const createWallet = async (name: string, visible: boolean) => {
    const enclaveApiClient = useEnclave();
    const backendJWT = useBackendJWT();
    const email = useEmail();

    await enclaveApiClient.createWallet(name, visible);
    await refresh();
    if (visible) {
        const wallet = wallets.value!.find(item => item.name === name);
        await backendApiClient.addWallet(wallet!.name, wallet!.address, email.value, backendJWT.value)
    }

}
</script>