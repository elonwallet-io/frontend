<template>
    <v-list :lines="false">
        <v-list-item v-for="emergencyAccessGrant in pagedEmergencyAccessGrants" :key="emergencyAccessGrant.email"
            class="border mx-4 my-2">
            <EmergencyAccessGrantsElement :grant="emergencyAccessGrant" @on-grants-changed="$emit('on-grants-changed')" />
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">
import { EmergencyAccessGrant } from '~/lib/types';

const stepSize = 5;

const props = defineProps<{
    grants: EmergencyAccessGrant[]
}>();

defineEmits(['on-grants-changed'])

const page = ref(1);
const pagedEmergencyAccessGrants = computed(() => {
    const start = (page.value - 1) * stepSize;
    return props.grants?.slice(start, start + stepSize) ?? []
});

</script>