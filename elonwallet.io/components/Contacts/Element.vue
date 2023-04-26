<template>
    <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
            <img src="~/assets/img/user-regular.svg" class="h-7 w-7 m-1" />
            <p>{{ contact.name }} </p>
        </div>
        <v-btn variant="plain" @click="onRemoveContact()" size="small">
            <img src="~/assets/img/trash-can-regular.svg" class="h-5 w-5" />
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { UINotificationType, User } from '~~/lib/types';
const backendJWT = useBackendJWT();
const { displayNotification, displayNotificationFromError } = useNotification();

const props = defineProps<{
    contact: User
}>();

const emit = defineEmits(['on-contact-removed'])

const onRemoveContact = async () => {
    try {
        await removeContact();
        displayNotification("Contact removed", `Contact ${props.contact.email} has been removed successfully`, UINotificationType.Success)
        emit('on-contact-removed');
    } catch (error) {
        displayNotificationFromError(error)
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

const removeContact = async () => {
    const backendApiClient = useBackend();
    await backendApiClient.removeContact(props.contact.email, backendJWT.value);
}
</script>