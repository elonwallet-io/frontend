<template>
    <main class="flex flex-col justify-center items-center h-screen bg-custom-light-gray">
        <h1 class="text-5xl font-bold mb-12">ElonWallet</h1>
        <NewDeviceEmail v-if="state === 'a'" @ready="state = 'b'" />
        <NewDeviceOtp v-else-if="state === 'b'" />
        <NewDeviceCredential v-else />
    </main>
</template>

<script setup lang="ts">

definePageMeta({
    layout: 'empty'
})

const state = ref('a')

</script>