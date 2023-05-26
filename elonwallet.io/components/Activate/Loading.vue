<template>
    <div class="flex flex-col items-center">
        <p class="text-2xl mb-8">Your personal Enclave is being deployed ...</p>
        <v-progress-circular :size="72" :width="7" indeterminate />
    </div>
</template>

<script setup lang="ts">
const { displayNotificationFromError } = useNotification();

const props = defineProps<{
    activationString: string,
}>();

const emit = defineEmits(['registered']);
const email = useEmail();

onMounted(async () => {
    try {
        await activateUser();
        emit('registered');
    }
    catch (error) {
        displayNotificationFromError(error);
    }
})

const activateUser = async () => {
    const backendApiClient = useBackend();
    await backendApiClient.activateUser(email.value, props.activationString);
    const enclaveURL = useEnclaveURL();
    enclaveURL.value = await backendApiClient.getEnclaveURL(email.value)
}
</script>