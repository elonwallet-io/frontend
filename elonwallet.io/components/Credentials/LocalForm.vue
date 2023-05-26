<template>
    <div>
        <p>1. Choose a unique name for your new credential.</p>
        <p>2. Hit save to start the webauthn registration flow.</p>
        <p>3. Try logging in with your new credential.</p>
        <v-form class="mt-4" validate-on="blur" ref="credentialForm" @submit.prevent>
            <v-text-field variant="solo" v-model="credentialName" :rules="credentialNameRules" label="Credential name" />
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
                <v-btn variant="text" color="primary" @click="onSave">Save</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { isUnique, isRequired, isAlphaNumeric } from '~/lib/VuetifyValidationRules';
import { WebauthnCredential, UINotificationType } from '~~/lib/types';
import { registerCredential } from '~~/lib/webauthn';
const { displayNotification, displayNotificationFromError } = useNotification();

const credentialForm = ref();

const props = defineProps<{
    credentials: WebauthnCredential[],
}>();

const emit = defineEmits(['discard', 'credential-created'])

const credentialNames = computed(() => props.credentials.map(item => item.name))

const credentialName = ref("");
const credentialNameRules = [
    isRequired("Credential Name"),
    isAlphaNumeric("Credential Name"),
    isUnique("Credential Name", credentialNames)
];
watchEffect(() => {
    if (credentialName.value) {
        credentialName.value = credentialName.value.trim();
    }
})

const onDiscard = async () => {
    credentialForm.value.reset();
    emit('discard');
}

const onSave = async () => {
    const { valid } = await credentialForm.value.validate();
    if (!valid)
        return;

    try {
        await createCredential(credentialName.value);
        displayNotification("Credential created", `Credential ${credentialName.value} has been created successfully`, UINotificationType.Success);
        credentialForm.value.reset();
        emit('credential-created');
    } catch (error) {
        displayNotificationFromError(error);
        if (error instanceof HttpError) {
            if (error.type === HttpErrorType.Unauthorized)
                navigateTo("/login")
            else if (error.type === HttpErrorType.Forbidden)
                navigateTo("/reauthenticate?redirect=%2Fcredentials")
        }
    }
};

const createCredential = async (name: string) => {
    const enclaveApiClient = useEnclave();
    const options = await enclaveApiClient.createCredentialInitialize();
    const credential = await registerCredential(options);
    await enclaveApiClient.createCredentialFinalize({
        name: name,
        creation_response: credential
    });
};
</script>