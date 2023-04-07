<template>
    <div class="w-9/12 m-auto mt-4">
        <v-alert :type="notification.type" :title="notification.title" :text="notification.text" />
    </div>
</template>

<script setup lang="ts">
import { UINotification } from '~~/lib/types';

defineProps<{
    notification: UINotification
}>();
</script>