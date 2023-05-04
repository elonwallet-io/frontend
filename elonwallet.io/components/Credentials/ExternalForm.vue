<template>
    <div>
        <p>1. Visit https://elonwallet.io/new-device on the device</p>
        <p>2. Enter the code you see below to authenticate.</p>
        <p>3. Follow the instructions to add your credential.</p>
        <v-form class="mt-4" ref="credentialForm" @submit.prevent>
            <v-text-field variant="solo" v-model="otpSecret" label="One Time Password" readonly />
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="$emit('discard')">Discard</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { OTP } from '~/lib/types';

const { displayNotificationFromError } = useNotification();

defineEmits(['discard'])
const otp = ref<OTP>();
const otpSecret = computed(() => otp.value?.secret)

onMounted(async () => {
    try {
        const enclaveApiClient = useEnclave();
        otp.value = await enclaveApiClient.getOTP();
    } catch (error) {
        displayNotificationFromError(error);
        if (error instanceof HttpError) {
            if (error.type === HttpErrorType.Unauthorized)
                navigateTo("/login")
            else if (error.type === HttpErrorType.Forbidden)
                navigateTo("/reauthenticate?redirect=%2Fcredentials")
        }
    }
})
</script>