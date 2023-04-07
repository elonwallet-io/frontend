<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <template v-slot:activator="{ props }">
                <v-btn variant="text" color="primary" v-bind="props">
                    + Add Webauthn Credential
                </v-btn>
            </template>
            <div class="p-4 flex flex-col gap-4 w-2/6 bg-white m-auto">
                <span class="text-xl">Add a new webauthn credential</span>
                <v-form ref="credentialForm" @submit.prevent>
                    <v-text-field variant="solo" v-model="credentialName" :rules="credentialNameRules"
                        label="Security Key name" />
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
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { WebauthnCredential, UINotificationType } from '~~/lib/types';
import { registerCredential, UrlEncodedPublicKeyCredential } from '~~/lib/webauthn';
const { enclaveApiClient } = useApi();
const { displayNotification, displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const dialog = ref<boolean>(false);
const props = defineProps<{
    credentials: WebauthnCredential[]
}>();
const emit = defineEmits(['credential-created'])
const credentialForm = ref();

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
    dialog.value = false;
}

const onSave = async () => {
    const { valid } = await credentialForm.value.validate();
    if (valid) {
        await createCredential(credentialName.value);
        credentialForm.value.reset();
        dialog.value = false;
    }
};

const createCredential = async (name: string) => {
    try {
        const options = await enclaveApiClient.createCredentialInitialize();
        const credential: UrlEncodedPublicKeyCredential = await registerCredential(options);
        await enclaveApiClient.createCredentialFinalize({
            name: name,
            creation_response: credential
        });
        displayNotification("Credential created", `Credential ${name} has been created successfully`, UINotificationType.Success);
        emit('credential-created');
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