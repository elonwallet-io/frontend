<template>
    <div class="bg-white shadow-md rounded-md p-2">
        <div class="flex justify-between items-center">
            <span class="font-bold">My Contacts</span>
            <DialogContactForm :contacts="contacts!" @create-contact="async () => await refresh()" />
        </div>
        <ContactsList :contacts="contacts!" />
    </div>
</template>

<script setup lang="ts">
const { contacts, refresh } = useContacts();

onMounted(async () => {
    await refresh();
})


</script>