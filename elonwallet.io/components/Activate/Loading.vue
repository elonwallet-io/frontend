<template>
    <div class="flex flex-col items-center">
        <p class="text-2xl mb-8">Your personal Enclave is being deployed ...</p>
        <v-progress-circular :size="72" :width="7" indeterminate />
    </div>
</template>

<script setup lang="ts">

import { HttpError } from '~/lib/HttpError';
const { displayNotificationFromHttpError, displayNetworkErrorNotification } = useNotification();

const props = defineProps<{
    email: string,
    activationString: string,
}>();

const emit = defineEmits(['registered']);

onMounted(async () => {
    try {

        const backendApiClient = useBackend();
        await backendApiClient.activateUser(props.email, props.activationString);
        const enclaveURL = useEnclaveURL();
        enclaveURL.value = await backendApiClient.getEnclaveURL(props.email)
        emit('registered');
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