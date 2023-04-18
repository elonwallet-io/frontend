<template>
    <div>
        <p>1. Choose a unique name for your new credential.</p>
        <p>2. Hit save to start the webauthn registration flow.</p>
        <p>3. Try logging in with your new credential.</p>
        <v-form class="mt-4" ref="credentialForm" @submit.prevent>
            <v-text-field variant="solo" v-model="credentialName" :rules="credentialNameRules" label="Credential name" />
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
                <v-btn variant="text" color="primary" @click="onSave">Save</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { WebauthnCredential, UINotificationType } from '~~/lib/types';
import { registerCredential, UrlEncodedPublicKeyCredential } from '~~/lib/webauthn';
const { displayNotification, displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const credentialForm = ref();

const props = defineProps<{
    credentials: WebauthnCredential[],
}>();

const emit = defineEmits(['discard', 'credential-created'])

const credentialName = ref("");
const credentialNameRules = [
    (value: string) => {
        if (value) return true

        return 'Credential name is required.'
    },
    (value: string) => {
        if (props.credentials.findIndex(item => item.name === value) === -1) return true
        return 'Credential name must be unique.'
    }
];

const onDiscard = async () => {
    credentialForm.value.reset();
    emit('discard');
}

const onSave = async () => {
    const { valid } = await credentialForm.value.validate();
    if (valid) {
        await createCredential(credentialName.value);
        credentialForm.value.reset();
        emit('credential-created');
    }
};

const createCredential = async (name: string) => {
    try {
        const enclaveApiClient = useEnclave();

        const options = await enclaveApiClient.createCredentialInitialize();
        const credential: UrlEncodedPublicKeyCredential = await registerCredential(options);
        await enclaveApiClient.createCredentialFinalize({
            name: name,
            creation_response: credential
        });
        displayNotification("Credential created", `Credential ${name} has been created successfully`, UINotificationType.Success);
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
    }
};
</script>