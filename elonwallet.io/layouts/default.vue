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
const ready = useSetup();
</script>
