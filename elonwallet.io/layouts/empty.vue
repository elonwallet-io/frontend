<template>
    <div>
        <Notification v-if="notification" :notification="notification" class="notification" />
        <slot />
    </div>
</template>

<script setup lang="ts">
const notification = useNotificationTimer();
</script>

<style scoped>
.notification {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}
</style>