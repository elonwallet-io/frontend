<template>
    <main class="flex justify-center items-center h-screen bg-custom-light-gray">
        <div class="flex flex-col gap-6 p-8 bg-white shadow-md rounded-md">
            <h1 class="text-3xl text-center">Sign in to ElonWallet</h1>
            <div class="p-8 border rounded-md">
                <v-form ref="form" class="flex flex-col gap-2 w-72" @submit.prevent>
                    <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Email address" />
                    <v-btn type="submit" variant="elevated" color="primary" block @click="onLogin">Sign in</v-btn>
                </v-form>
            </div>
            <div class="p-4 border rounded-md text-center text-lg">
                <span>New to ElonWallet?</span>
                <NuxtLink to="/signup" class="text-blue-600">
                    Sign up
                </NuxtLink>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { EnclaveApiClient } from '~/lib/EnclaveApiClient';
import { solveLoginChallenge } from '~/lib/webauthn'
import { HttpError } from '~~/lib/HttpError';

definePageMeta({
    layout: 'empty'
})
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();
const { backendApiClient } = useApi();
const enclaveURL = useEnclaveURL();


const email = ref("");
const emailRules = [
    (value: string) => {
        if (value) return true

        return 'Email is required.'
    },
    (value: string) => {
        if (/.+@.+\..+/.test(value)) return true

        return 'Email must be valid.'
    },
];

const form = ref();

const onLogin = async () => {
    const { valid } = await form.value.validate()
    if (valid && window.PublicKeyCredential) {
        try {
            enclaveURL.value = await backendApiClient.getEnclaveURL(email.value);
            const { enclaveApiClient } = useApi();

            const options = await enclaveApiClient.loginInitialize();
            const credential = await solveLoginChallenge(options);
            await enclaveApiClient.loginFinalize(credential);

            //Set this here, because we need to be able to get this when a user refreshes the main page without reauth
            window.localStorage.setItem("enclave_url", enclaveURL.value);

            navigateTo("/")
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
