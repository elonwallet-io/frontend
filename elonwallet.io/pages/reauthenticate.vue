<template>
    <main class="flex justify-center items-center h-screen bg-custom-light-gray">
        <div class="flex flex-col items-center p-8 bg-white shadow-md rounded-md">
            <h1 class="text-5xl font-bold mb-8">ElonWallet</h1>
            <p class="text-2xl">You are trying to access sensitive resources.</p>
            <p class="text-2xl">Let's make sure it's really you.</p>
            <p class="text-2xl">Verify your identity by pressing the button below</p>
            <v-btn variant="elevated" color="primary" class="mt-4" @click="onReauthentication">Reauthenticate</v-btn>
        </div>
    </main>
</template>

<script setup lang="ts">
import { solveLoginChallenge } from '~/lib/webauthn'
import { HttpError } from '~~/lib/HttpError';

definePageMeta({
    layout: 'empty'
})
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();
const { enclaveApiClient } = useApi();

const route = useRoute();
const redirect = route.query.redirect?.toString() ?? "/";

const onReauthentication = async () => {
    if (window.PublicKeyCredential) {
        try {
            const options = await enclaveApiClient.loginInitialize();
            const credential = await solveLoginChallenge(options);
            await enclaveApiClient.loginFinalize(credential);

            navigateTo(redirect)
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
