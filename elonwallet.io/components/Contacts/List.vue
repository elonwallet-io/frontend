<template>
    <v-list :lines="false">
        <v-list-item v-for="contact in contacts" :key="contact.name" class="border mx-4 my-2"
            @click="onClickContact(contact)">
            <ContactsElement :contact="contact" />
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">
import { User } from '~~/lib/types';

defineProps<{
    contacts?: User[]
}>();

const onClickContact = (contact: User) => {
    console.log(contact);
};
</script>