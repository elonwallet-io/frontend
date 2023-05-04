<template>
    <div class="flex justify-center">
        <div v-if="show" class="w-full">
            <ClientOnly>
                <QrcodeStream @decode="onDecode" @init="onInit" />
            </ClientOnly>
        </div>
        <div v-else
            class="flex flex-col items-center gap-6 border-4 border-dashed rounded-2xl border-custom-light-blue p-4 w-full">
            <img src="~/assets/img/qr-icon.svg" class="h-32 w-32" />
            <v-btn variant="elevated" color="primary" @click="show = true">Scan QR code</v-btn>
        </div>
    </div>
</template>
<script setup lang="ts">
import { QrcodeStream } from 'vue3-qrcode-reader'
const { displayNotification } = useNotification();
const emit = defineEmits(['onQrCodeScanned'])
const show = ref(false);

const onDecode = (result: string) => {
    show.value = false;
    emit('onQrCodeScanned', result);
}

const onInit = async (promise: Promise<MediaTrackCapabilities>) => {
    try {
        await promise
    } catch (error: any) {
        if (error.name === 'NotAllowedError') {
            displayNotification("Not allowed", "You need to grant camera access permissions");
        } else if (error.name === 'NotFoundError') {
            displayNotification("No camera found", "No camera found on device");
        } else if (error.name === 'NotReadableError') {
            displayNotification("Camera already in use", "Your camera is already used by another application");
        } else if (error.name === 'OverconstrainedError') {
            displayNotification("Camera not supported", "This camera is not supported");
        } else if (error.name === 'StreamApiNotSupportedError') {
            displayNotification("Camera stream api not supported", "Your browser does not support the camera stream api.");
        } else {
            displayNotification("Camera error", error.name);
        }
    }
}
</script>