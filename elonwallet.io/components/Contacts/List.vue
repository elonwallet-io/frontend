<template>
    <v-list :lines="false">
        <v-list-item v-for="contact in pagedContacts" :key="contact.name" class="border mx-4 my-2">
            <ContactsElement :contact="contact" @on-contact-removed="$emit('on-contact-removed')" />
        </v-list-item>
    </v-list>
    <v-pagination v-if="length" :length="length" variant="text" v-model="page" />
</template>

<script setup lang="ts">
import { User } from '~~/lib/types';

const stepSize = 5;

const props = defineProps<{
    contacts: User[]
}>();

defineEmits(['on-contact-removed'])

const page = ref(1);
const pagedContacts = computed(() => {
    const start = (page.value - 1) * stepSize;
    return props.contacts?.slice(start, start + stepSize) ?? []
});

const length = computed(() => Math.ceil(props.contacts.length / stepSize))

</script>