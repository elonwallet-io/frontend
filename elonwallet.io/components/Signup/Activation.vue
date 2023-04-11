<template>
    <div class="flex flex-col align-center w-1/4">
        <h1 class="text-5xl font-bold mb-12">ElonWallet</h1>
        <p class="text-2xl">Your account is not active yet.</p>
        <p class="text-2xl">Please verify your email.</p>
        <p class="text-center mt-4">Check your inbox for the activation link. Be sure to also look into your spam/junk
            folder just in case. If you
            don't verify your email address within 14 days we'll have to automatically delete your account (and nobody wants
            that).</p>
        <div class="flex py-5 items-center w-full">
            <div class="flex-grow border-t-2 border-custom-light-blue opacity-30"></div>
            <span class="flex-shrink mx-4 text-custom-light-blue opacity-80">or</span>
            <div class="flex-grow border-t-2 border-custom-light-blue opacity-30"></div>
        </div>
        <v-btn variant="outlined" color="primary" @click="onResendActivationLink">Resend Activation Link</v-btn>
    </div>
</template>

<script setup lang="ts">
import { HttpError } from '~/lib/HttpError';
import { UINotificationType } from '~/lib/types';

const { displayNetworkErrorNotification, displayNotificationFromHttpError, displayNotification } = useNotification();
const { backendApiClient } = useApi();
const email = useEmail();


const onResendActivationLink = async () => {
    try {
        if (email.value) {
            await backendApiClient.resendActivationLink(email.value);
            displayNotification("Resend Activation Email", "The activation email has been resent to your inbox.", UINotificationType.Success);
        }
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