<template>
    <v-list :lines="false">
        <v-list-item v-for="emergencyContact in pagedEmergencyContacts" :key="emergencyContact.email"
            class="border mx-4 my-2">
            <EmergencyContactsElement :contact="emergencyContact" @on-contacts-changed="$emit('on-contacts-changed')" />
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">
import { EmergencyAccessContact } from '~/lib/types';

const stepSize = 5;

const props = defineProps<{
    contacts: EmergencyAccessContact[]
}>();

defineEmits(['on-contacts-changed'])

const page = ref(1);
const pagedEmergencyContacts = computed(() => {
    const start = (page.value - 1) * stepSize;
    return props.contacts?.slice(start, start + stepSize) ?? []
});

</script>