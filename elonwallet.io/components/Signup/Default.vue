<template>
    <div class="flex flex-col gap-6 p-8 bg-white shadow-md rounded-md">
        <h1 class="text-3xl text-center">Sign up for ElonWallet</h1>
        <div class="p-6 border rounded-md">
            <v-form ref="form" class="flex flex-col gap-2 w-80" @submit.prevent>
                <v-text-field variant="solo" v-model="name" :rules="nameRules" label="Name"
                    hint="Note: This name will be publicly visible" />
                <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Email address" />
                <v-btn type="submit" variant="elevated" color="primary" block @click="onSignup">Sign up</v-btn>
            </v-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { HttpError } from '~~/lib/HttpError';

const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();
const userEmail = useEmail();
const emit = defineEmits(['on-signup'])

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
    if (valid) {
        try {
            const backendApiClient = useBackend();

            await backendApiClient.createUser(name.value, email.value);
            userEmail.value = email.value;
            emit('on-signup');
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