<template>
    <div class="bg-custom-light-gray min-h-screen">
        <HeaderBar />
        <div>
            <Notification v-if="notification" :notification="notification" />
        </div>
        <main>
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
import { UINotification } from '~~/lib/types';

const notification = useState<UINotification | undefined>('notification');
const notificationTimeoutID = ref<number | undefined>();
const enclaveURL = useEnclaveURL();

const startNotificationTimer = () => {
    if (notification.value) {
        notificationTimeoutID.value = window.setTimeout(() => {
            notification.value = undefined;
        }, 10000)
    }
}

const stopNotificationTimer = () => {
    if (notificationTimeoutID.value) {
        window.clearTimeout(notificationTimeoutID.value);
        notificationTimeoutID.value = undefined;
    }
}

watch(notification, () => {
    stopNotificationTimer();
    startNotificationTimer();
})

onMounted(() => {
    startNotificationTimer();
    const enclaveURLls = window.localStorage.getItem("enclave_url");
    if (enclaveURLls && enclaveURL.value != enclaveURLls) {
        enclaveURL.value = enclaveURLls
    }
})

onUnmounted(() => {
    stopNotificationTimer();
})
</script>
