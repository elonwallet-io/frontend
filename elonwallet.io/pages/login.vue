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
import { isEmail, isRequired } from '~/lib/VuetifyValidationRules';
import { solveLoginChallenge } from '~/lib/webauthn'

definePageMeta({
    layout: 'empty'
})
const { displayNotificationFromError, displayNotification } = useNotification();

const email = ref("");
const emailRules = [
    isRequired("Email"),
    isEmail()
];

const form = ref();

const onLogin = async () => {
    const { valid } = await form.value.validate()
    if (!valid)
        return;
    if (!window.PublicKeyCredential)
        displayNotification("Webauthn not supported", "Your browser does not seem to support the webauthn standard");

    try {
        await login();
        navigateTo("/app")
    }
    catch (error) {
        displayNotificationFromError(error);
    }
}


const login = async () => {
    const backendApiClient = useBackend();
    const enclaveURL = useEnclaveURL();
    enclaveURL.value = await backendApiClient.getEnclaveURL(email.value)

    const enclaveApiClient = useEnclave();
    const options = await enclaveApiClient.loginInitialize();
    const credential = await solveLoginChallenge(options);
    const backendJWT = await enclaveApiClient.loginFinalize(credential);

    //Set this here, because we need to be able to get this when a user refreshes the main page without reauth
    localStorage.setItem("email", email.value);
    localStorage.setItem("enclave_url", enclaveURL.value);
    localStorage.setItem("backend_jwt", backendJWT)
}
</script>
