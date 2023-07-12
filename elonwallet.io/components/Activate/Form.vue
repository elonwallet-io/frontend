<template>
    <div class="flex flex-col items-center">
        <p class="text-2xl text-center">Your Wallet Service is ready to be set up.</p>
        <p class="text-2xl text-center">Please have your security key or passkey ready.</p>
        <v-form ref="form" validate-on="blur" class="flex flex-col gap-2 w-72 m-8" @submit.prevent>
            <v-text-field variant="solo" v-model="credentialName" :rules="credentialNameRules" label="Credential Name"
                hint="Choose a name for your login credential" />
            <v-btn type="submit" variant="elevated" color="primary" block @click="onRegisterNewCredential">Register my
                credential</v-btn>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { isAlphaNumeric, isRequired } from '~/lib/VuetifyValidationRules';
import { registerCredential } from '~/lib/webauthn';
const { displayNotification, displayNotificationFromError } = useNotification();

const form = ref();
const credentialName = ref("");
const credentialNameRules = [
    isRequired("Credential Name"),
    isAlphaNumeric("Credential Name")
];
watchEffect(() => {
    if (credentialName.value) {
        credentialName.value = credentialName.value.trim();
    }
})


const onRegisterNewCredential = async () => {
    const { valid } = await form.value.validate()
    if (!valid)
        return;

    if (!window.PublicKeyCredential)
        displayNotification("Webauthn not supported", "Your browser does not seem to support the webauthn standard");

    try {
        await registerNewCredential();
        navigateTo("/app")
    }
    catch (error) {
        displayNotificationFromError(error);
    }
}

const registerNewCredential = async () => {
    const email = useEmail();
    const enclaveURL = useEnclaveURL();
    const backendJWT = useBackendJWT();
    const enclaveApiClient = useEnclave();

    const options = await enclaveApiClient.registerInitialize(email.value);
    const credential = await registerCredential(options);
    backendJWT.value = await enclaveApiClient.registerFinalize({ name: credentialName.value, creation_response: credential });

    //Set this here, because we need to be able to get this when a user refreshes the main page without reauth
    localStorage.setItem("email", email.value);
    localStorage.setItem("enclave_url", enclaveURL.value);
    localStorage.setItem("backend_jwt", backendJWT.value)
}
</script>