<template>
    <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
            <img src="~/assets/img/user-regular.svg" class="h-7 w-7 m-1" />
            <p>{{ contact.name }} </p>
        </div>
        <v-btn variant="plain" @click="onRemove()" size="small">
            <img src="~/assets/img/trash-can-regular.svg" class="h-5 w-5" />
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { UINotificationType, User } from '~~/lib/types';
const handleError = useApiErrorHandling();
const backendJWT = useBackendJWT();
const { displayNotification } = useNotification();

const props = defineProps<{
    contact: User
}>();

const emit = defineEmits(['on-contact-removed'])

const onRemove = async () => {
    handleError(async () => {
        const backendApiClient = useBackend();
        await backendApiClient.removeContact(props.contact.email, backendJWT.value);
        displayNotification("Contact removed", `Contact ${props.contact.email} has been removed successfully`, UINotificationType.Success)
        emit('on-contact-removed');
    })
}
</script>