<template>
    <main class="flex flex-col justify-center items-center h-screen bg-custom-light-gray">
        <h1 class="text-5xl font-bold mb-12">ElonWallet</h1>
        <NewDeviceAuthentication v-if="!loggedIn" @on-authenticated="loggedIn = true" />
        <NewDeviceCredential v-else />
    </main>
</template>

<script setup lang="ts">

definePageMeta({
    layout: 'empty'
})

const loggedIn = ref(false)
</script>