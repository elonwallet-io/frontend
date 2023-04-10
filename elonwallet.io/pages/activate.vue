<template>
    <main class="flex flex-col justify-center items-center h-screen bg-custom-light-gray">
        <h1 class="text-5xl font-bold mb-12">ElonWallet</h1>
        <div v-if="!enclaveURL" class="flex flex-col items-center">
            <p class="text-2xl mb-8">Your personal Enclave is being deployed ...</p>
            <v-progress-circular :size="72" :width="7" indeterminate />
        </div>
        <div v-else class="flex flex-col items-center">
            <p class="text-2xl text-center">Your Enclave is ready to be set up.</p>
            <p class="text-2xl text-center">Please have your security key or passkey ready.</p>
            <v-form ref="form" class="flex flex-col gap-2 w-72 m-8" @submit.prevent>
                <v-text-field variant="solo" v-model="credentialName" :rules="credentialNameRules" label="Credential Name"
                    hint="Choose a name for your login credential" />
                <v-btn type="submit" variant="elevated" color="primary" block @click="onRegisterCredentials">Register my
                    credential</v-btn>
            </v-form>
        </div>
    </main>
</template>

<script setup lang="ts">
import { HttpError } from '~/lib/HttpError';
import { registerCredential } from '~/lib/webauthn';

definePageMeta({
    layout: 'empty'
})

const route = useRoute();
const email = useEmail();
email.value = route.query.user?.toString() ?? "";
const activationString = route.query.activation_string?.toString() ?? "";
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();
const { backendApiClient } = useApi();

const enclaveURL = ref("");

onMounted(async () => {
    try {
        await backendApiClient.activateUser(email.value, activationString);
        enclaveURL.value = await backendApiClient.getEnclaveURL(email.value);
    }
    catch (error) {
        if (error instanceof HttpError) {
            displayNotificationFromHttpError(error);
        } else {
            displayNetworkErrorNotification();
        }
    }
})

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
            const { enclaveApiClient } = useApi();

            const options = await enclaveApiClient.registerInitialize(email.value);
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