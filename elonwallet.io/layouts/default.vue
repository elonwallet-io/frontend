<template>
    <div class="bg-custom-light-gray min-h-screen">
        <HeaderBar />
        <div>
            <Notification v-if="notification" :notification="notification" />
        </div>
        <main>
            <slot v-if="ready" />
        </main>
    </div>
</template>

<script setup lang="ts">
const notification = useNotificationTimer();
const ready = ref(false);

const email = useEmail();
const backendJWT = useBackendJWT();
const enclaveURL = useEnclaveURL();

onBeforeMount(() => {
    email.value = localStorage.getItem('email')!;
    backendJWT.value = localStorage.getItem('backend_jwt')!;
    enclaveURL.value = localStorage.getItem('enclave_url')!;
    console.log(email.value)
    console.log(backendJWT.value)
    console.log(enclaveURL.value)

    ready.value = true;
})

</script>
