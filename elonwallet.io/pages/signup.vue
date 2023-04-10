<template>
    <main class="flex justify-center items-center h-screen bg-custom-light-gray">
        <SignupDefault v-if="!registered" @on-signup="registered = true" />
        <SignupActivation v-else />
    </main>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'empty'
})

const registered = ref(false);

</script>
