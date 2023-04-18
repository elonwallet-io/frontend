<template>
    <div>
        <p>1. Visit https://elonwallet.io/new-device on the device</p>
        <p>2. Follow the instructions on the page.</p>
        <p>3. Authorize the request with the code provided.</p>
        <v-form class="mt-4" ref="credentialForm" @submit.prevent>
            <v-text-field variant="solo" v-model="otp" :rules="otpRules" label="One Time Password" />
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
                <v-btn variant="text" color="primary" @click="onAuthorize">Authorize</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { WebauthnCredential, UINotificationType } from '~~/lib/types';
const { displayNotification, displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const credentialForm = ref();

const props = defineProps<{
    credentials: WebauthnCredential[],
}>();

const emit = defineEmits(['discard', 'authorize'])

const otp = ref("");
const otpRules = [
    (value: string) => {
        if (/^[0-9]{6}$/.test(value)) return true

        return 'Invalid one time password'
    }
];

const onDiscard = async () => {
    credentialForm.value.reset();
    emit('discard');
}

const onAuthorize = async () => {
    const { valid } = await credentialForm.value.validate();
    if (valid) {
        const ok = await authorizeCredentialRequest(otp.value);
        if (ok) {
            credentialForm.value.reset();
            emit('authorize');
        }
    }
};

const authorizeCredentialRequest = async (otp: string): Promise<boolean> => {
    try {
        const enclaveApiClient = useEnclave();
        await enclaveApiClient.authorizeNewDevice(otp);
        return true;
    }
    catch (error) {
        if (error instanceof HttpError) {
            displayNotificationFromHttpError(error);
            if (error.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        } else {
            displayNetworkErrorNotification();
        }
        return false;
    }
};
</script>