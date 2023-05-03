<template>
    <div class="flex gap-2 items-center py-2">
        <img :src="metadata.icons[0]" alt="Dapp Icon" class="h-12 w-12" />
        <div>
            <h3 class="font-bold text-xl">{{ metadata.name }}</h3>
            <a :href="metadata.url" class="text-blue-500">{{ metadata.url }}</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CoreTypes } from '@walletconnect/types';

defineProps<{
    metadata: CoreTypes.Metadata
}>();
</script>