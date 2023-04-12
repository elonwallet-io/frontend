<template>
    <div class="flex gap-2 items-center">
        <img src="~/assets/img/user-regular.svg" class="h-7 w-7 m-1" />
        <span>{{ contact.name }} </span>
    </div>
</template>

<script setup lang="ts">
import { User } from '~~/lib/types';

defineProps<{
    contact: User
}>();
</script>