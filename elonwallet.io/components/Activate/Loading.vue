<template>
    <div class="flex flex-col items-center">
        <p class="text-2xl mb-8">Your personal Enclave is being deployed ...</p>
        <v-progress-circular :size="72" :width="7" indeterminate />
    </div>
</template>

<script setup lang="ts">

import { HttpError } from '~/lib/HttpError';
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();
const { backendApiClient } = useApi();
const enclaveURL = useEnclaveURL();

const props = defineProps<{
    email: string,
    activationString: string,
}>();

onMounted(async () => {
    try {
        await backendApiClient.activateUser(props.email, props.activationString);
        enclaveURL.value = await backendApiClient.getEnclaveURL(props.email);
    }
    catch (error) {
        if (error instanceof HttpError) {
            displayNotificationFromHttpError(error);
        } else {
            displayNetworkErrorNotification();
        }
    }
})
</script>