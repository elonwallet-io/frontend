<template>
    <div class="bg-white shadow-md rounded-md p-2">
        <div class="flex justify-between items-center">
            <span class="font-bold">My Contacts</span>
            <DialogContactForm :contacts="contacts!" @create-contact="refresh()" />
        </div>
        <ContactsList v-if="contacts" :contacts="contacts" @on-contact-removed="refresh()" />
    </div>
</template>

<script setup lang="ts">
const { contacts, refresh } = useContacts();
</script>