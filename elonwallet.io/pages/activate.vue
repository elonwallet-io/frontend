<template>
    <main class="flex flex-col justify-center items-center h-screen bg-custom-light-gray">
        <h1 class="text-5xl font-bold mb-12">ElonWallet</h1>
        <ActivateLoading v-if="!registered" :activation-string="activationString" @registered="registered = true" />
        <ActivateForm v-else />
    </main>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'empty'
})

const registered = ref(false);

const route = useRoute();
const activationString = route.query.activation_string?.toString() ?? "";
const email = useEmail();
email.value = route.query.user?.toString() ?? "";
</script>