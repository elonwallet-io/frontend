<template>
    <v-dialog v-model="dialog" persistent>
        <template v-slot:activator="{ props }">
            <v-btn :disabled="disable ?? false" variant="plain" color="primary" size="small" v-bind="props">
                <slot />
            </v-btn>
        </template>
        <div class="p-4 flex flex-col gap-4 w-2/6 bg-white m-auto">
            <span class="text-xl">{{ text }}</span>
            <div class="flex justify-end">
                <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
                <v-btn variant="text" color="primary" @click="onConfirm">Confirm</v-btn>
            </div>
        </div>
    </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref(false);

defineProps<{
    text: string,
    disable?: boolean,
}>();

const emit = defineEmits<{
    (e: 'on-confirm'): void
}>();

const onDiscard = async () => {
    dialog.value = false;
}

const onConfirm = async () => {
    dialog.value = false;
    emit('on-confirm');
};

</script>