<template>
    <main class="flex justify-center items-center h-screen bg-custom-light-gray">
        <div class="flex flex-col gap-6 p-8 bg-white shadow-md rounded-md">
            <h1 class="text-3xl text-center">Sign up for ElonWallet</h1>
            <div class="p-6 border rounded-md">
                <v-form ref="form" class="flex flex-col gap-2 w-80" @submit.prevent>
                    <v-text-field variant="solo" v-model="name" :rules="nameRules" label="Name"
                        hint="Note: This name will be publicly visible" />
                    <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Email address" />
                    <v-btn type="submit" variant="elevated" color="success" block @click="onSignup">Sign up</v-btn>
                </v-form>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { UrlEncodedPublicKeyCredential } from '~/lib/webauthn'
import { registerCredential } from '~/lib/webauthn'
import { HttpError } from '~~/lib/HttpError';

definePageMeta({
    layout: 'empty'
})

const { enclaveApiClient, backendApiClient } = useApi();
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const name = ref("");
const nameRules = [
    (value: string) => {
        if (value) return true

        return 'Name is required.'
    }
];

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

const onSignup = async () => {
    const { valid } = await form.value.validate()
    if (valid && window.PublicKeyCredential) {
        try {
            await backendApiClient.createUser(name.value, email.value);

            const options = await enclaveApiClient.registerInitialize(email.value);
            const credential: UrlEncodedPublicKeyCredential = await registerCredential(options);
            await enclaveApiClient.registerFinalize(credential);

            navigateTo("/login");
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
