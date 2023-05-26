<template>
    <div class="flex flex-col gap-6 p-8 bg-white shadow-md rounded-md">
        <h1 class="text-3xl text-center">Sign up for ElonWallet</h1>
        <div class="p-6 border rounded-md">
            <v-form ref="form" validate-on="blur" class="flex flex-col gap-2 w-80" @submit.prevent>
                <v-text-field variant="solo" v-model="name" :rules="nameRules" label="Name"
                    hint="Note: This name will be publicly visible" />
                <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Email address" />
                <v-btn type="submit" variant="elevated" color="primary" block @click="onSignup">Sign up</v-btn>
            </v-form>
        </div>
        <div class="p-4 border rounded-md text-center text-lg">
            <span>Already have an account?</span>
            <NuxtLink to="/login" class="text-blue-600">
                Sign in
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { isEmail, isRequired } from '~/lib/VuetifyValidationRules';

const { displayNotificationFromError } = useNotification();
const userEmail = useEmail();
const emit = defineEmits(['on-signup'])

const name = ref("");
const nameRules = [
    isRequired("Name")
];
watchEffect(() => {
    if (name.value) {
        name.value = name.value.trim();
    }
})

const email = ref("");
const emailRules = [
    isRequired("Email"),
    isEmail()
];
watchEffect(() => {
    if (email.value) {
        email.value = email.value.trim();
    }
})

const form = ref();

const onSignup = async () => {
    const { valid } = await form.value.validate()
    if (!valid)
        return;

    try {
        await signup();
        emit('on-signup');
    }
    catch (error) {
        displayNotificationFromError(error);
    }
}

const signup = async () => {
    const backendApiClient = useBackend();

    await backendApiClient.createUser(name.value, email.value);
    userEmail.value = email.value;
}
</script>