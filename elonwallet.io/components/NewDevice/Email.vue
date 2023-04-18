<template>
    <p class="text-2xl">Before adding a new credential to your account, we need to verify it's really you.</p>
    <p class="text-2xl">Please tell us the email address of your account.</p>
    <v-form ref="form" class="flex flex-col gap-2 w-72 m-8" @submit.prevent>
        <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Email address" />
        <v-btn type="submit" variant="elevated" color="primary" block @click="onStartFlow">Proceed</v-btn>
    </v-form>
</template>


<script setup lang="ts">
import { HttpError } from '~/lib/HttpError';

const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const emit = defineEmits(['ready']);

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

const onStartFlow = async () => {
    try {
        const backendApiClient = useBackend();
        const enclaveURL = useEnclaveURL();
        enclaveURL.value = await backendApiClient.getEnclaveURL(email.value)
        emit('ready');
    }
    catch (error) {
        if (error instanceof HttpError) {
            displayNotificationFromHttpError(error);
        } else {
            displayNetworkErrorNotification();
        }
    }
}
</script>