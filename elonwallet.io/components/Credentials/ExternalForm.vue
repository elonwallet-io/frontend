<template>
    <div>
        <p>1. Visit https://elonwallet.io/new-device on the device</p>
        <p>2. Enter the code you see below to authenticate.</p>
        <p>3. Follow the instructions to add your credential.</p>
        <v-form class="mt-4" ref="credentialForm" @submit.prevent>
            <v-text-field variant="solo" v-model="otpSecret" label="One Time Password" readonly />
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { OTP } from '~/lib/types';
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();


const emit = defineEmits(['discard'])
const otp = ref<OTP>();
const otpSecret = ref("");

watch(otp, () => {
    if (otp.value) {
        console.log(otp.value)
        otpSecret.value = otp.value.secret;
    }
})


const onDiscard = async () => {
    emit('discard');
}

onMounted(async () => {
    try {
        const enclaveApiClient = useEnclave();
        otp.value = await enclaveApiClient.getOTP();
        if (!otp.value.active) {
            await enclaveApiClient.createOTP();
            otp.value = await enclaveApiClient.getOTP();
        }
    }
    catch (error) {
        if (error instanceof HttpError) {
            displayNotificationFromHttpError(error);
            if (error.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        } else {
            displayNetworkErrorNotification();
        }
    }
})

</script>