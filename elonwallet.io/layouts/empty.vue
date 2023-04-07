<template>
    <div>
        <Notification v-if="notification" :notification="notification" class="notification" />
        <slot />
    </div>
</template>

<script setup lang="ts">
import { UINotification } from '~~/lib/types';

const notification = useState<UINotification | undefined>('notification');
const notificationTimeoutID = ref<number | undefined>();

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
})

onUnmounted(() => {
    stopNotificationTimer();
})
</script>

<style scoped>
.notification {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}
</style>