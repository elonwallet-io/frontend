<template>
    <v-list :lines="false">
        <v-list-item v-for="contact in contacts" :key="contact.name" class="border mx-4 my-2"
            @click="onClickContact(contact)">
            <div class="flex gap-2 items-center">
                <img src="~/assets/img/user-regular.svg" class="h-7 w-7 m-1" />
                <span>{{ contact.name }}</span>
            </div>
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
    alert("TODO");
};
</script>