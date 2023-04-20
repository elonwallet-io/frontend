<template>
    <div class="flex flex-col items-center">
        <p class="text-2xl text-center">We are ready to register your credential.</p>
        <p class="text-2xl text-center">Click the button below to add your new credential</p>
        <v-form ref="form" class="flex flex-col gap-2 w-72 m-8" @submit.prevent>
            <v-text-field variant="solo" v-model="credentialName" :rules="credentialNameRules" label="Credential Name"
                hint="Choose a name for your login credential" />
            <v-btn type="submit" variant="elevated" color="primary" block @click="onAddCredential">Add my
                Credential</v-btn>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { HttpError } from '~/lib/HttpError';
import { isAlphaNumeric, isRequired } from '~/lib/VuetifyValidationRules';
import { registerCredential } from '~/lib/webauthn';
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const form = ref();
const credentialName = ref("");
const credentialNameRules = [
    isRequired("Credential Name"),
    isAlphaNumeric("Credential Name")
];


const onAddCredential = async () => {
    const { valid } = await form.value.validate()
    if (valid && window.PublicKeyCredential) {
        try {
            const enclaveApiClient = useEnclave();

            const options = await enclaveApiClient.createCredentialInitialize();
            const credential = await registerCredential(options);
            await enclaveApiClient.createCredentialFinalize({ name: credentialName.value, creation_response: credential });

            navigateTo("/login")
        }
        catch (error) {
            if (error instanceof HttpError) {
                displayNotificationFromHttpError(error);
            } else {
                displayNetworkErrorNotification();
            }
        }
    }
}
</script>