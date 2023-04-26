<template>
    <p class="text-2xl">Before adding a new credential to your account, we need to verify it's really you.</p>
    <p class="text-2xl">Please provide us with your email address and the secret you generated earlier.</p>
    <v-form ref="form" class="flex flex-col gap-2 w-72 m-8" @submit.prevent>
        <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Email address" />
        <v-text-field variant="solo" v-model="otp" :rules="otpRules" label="OTP" />
        <v-btn type="submit" variant="elevated" color="primary" block @click="onLogin">Login</v-btn>
    </v-form>
</template>


<script setup lang="ts">
import { isEmail, isOTP, isRequired } from '~/lib/VuetifyValidationRules';

const { displayNotificationFromError, displayNotification } = useNotification();

const emit = defineEmits(['on-authenticated']);

const email = ref("");
const emailRules = [
    isRequired("Email"),
    isEmail()
];

const otp = ref("");
const otpRules = [
    isRequired("OTP"),
    isOTP()
];

const form = ref();

const onLogin = async () => {
    const { valid } = await form.value.validate();
    if (!valid)
        return;

    try {
        await loginWithOTP();
        emit('on-authenticated');
    } catch (error) {
        displayNotificationFromError(error);
    }

}

const loginWithOTP = async () => {
    const backendApiClient = useBackend();
    const enclaveURL = useEnclaveURL();
    enclaveURL.value = await backendApiClient.getEnclaveURL(email.value)

    const enclaveApiClient = useEnclave();
    await enclaveApiClient.loginWithOTP(otp.value);
}
</script>