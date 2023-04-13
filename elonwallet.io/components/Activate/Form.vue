<template>
    <div class="flex flex-col items-center">
        <p class="text-2xl text-center">Your Enclave is ready to be set up.</p>
        <p class="text-2xl text-center">Please have your security key or passkey ready.</p>
        <v-form ref="form" class="flex flex-col gap-2 w-72 m-8" @submit.prevent>
            <v-text-field variant="solo" v-model="credentialName" :rules="credentialNameRules" label="Credential Name"
                hint="Choose a name for your login credential" />
            <v-btn type="submit" variant="elevated" color="primary" block @click="onRegisterCredentials">Register my
                credential</v-btn>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { HttpError } from '~/lib/HttpError';
import { registerCredential } from '~/lib/webauthn';
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const props = defineProps<{
    email: string,
}>();

const form = ref();
const credentialName = ref("");
const credentialNameRules = [
    (value: string) => {
        if (value) return true

        return 'Credential Name is required.'
    },
];


const onRegisterCredentials = async () => {
    const { valid } = await form.value.validate()
    if (valid && window.PublicKeyCredential) {
        try {
            const enclaveApiClient = useEnclave();

            const options = await enclaveApiClient.registerInitialize(props.email);
            const credential = await registerCredential(options);
            await enclaveApiClient.registerFinalize({ name: credentialName.value, creation_response: credential });

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