<template>
    <div class="flex flex-col items-center gap-4">
        <p class="text-2xl text-center">Enter to One Time Password you see below on a logged in device</p>
        <div class="p-2 border rounded-lg shadow-md bg-white w-fit">
            <p class="text-3xl text-center">{{ otp }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['ready']);

const enclaveURL = useEnclaveURL();
const otp = ref("123456");

const evtSource = new EventSource(`//${enclaveURL}/credentials/sse`);
evtSource.onmessage = (event) => {
    console.log(event.data)
}

</script>
