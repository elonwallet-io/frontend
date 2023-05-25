<template>
    <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
            <img src="~/assets/img/user-regular.svg" class="h-7 w-7 m-1" />
            <p>{{ contact.email }} </p>
        </div>
        <p v-if="!contact.has_accepted" class="opacity-60">Invitation pending</p>
        <p v-else-if="takeoverWaitPeriodExpired" class="text-red-500">Takeover grace period expired</p>
        <p v-else-if="contact.has_requested_takeover" class="text-amber-500">Takeover pending until {{ takeoverDate }}</p>
        <div>
            <DialogConfirm v-if="contact.has_requested_takeover"
                text="Are you sure you want to deny the emergency access request?"
                @on-confirm="onDenyEmergencyAccessRequest()">
                <img src="~/assets/img/ban-solid.svg" class="h-5 w-5" title="Deny pending request" />
            </DialogConfirm>
            <DialogConfirm text="Are you sure you want to remove this emergency contact?"
                @on-confirm="onRemoveEmergencyContact()">
                <img src="~/assets/img/trash-can-regular.svg" class="h-5 w-5" title="Remove emergency contact" />
            </DialogConfirm>
        </div>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { EmergencyAccessContact, UINotificationType } from '~/lib/types';
const { displayNotification, displayNotificationFromError } = useNotification();

const props = defineProps<{
    contact: EmergencyAccessContact
}>();

const emit = defineEmits(['on-contacts-changed'])

const takeoverDate = computed(() => {
    const date = new Date(props.contact.takeover_allowed_after * 1000);
    return date.toLocaleString();
})

const takeoverWaitPeriodExpired = computed(() => {
    const current = new Date();
    const takeoverDate = new Date(props.contact.takeover_allowed_after * 1000);
    return current > takeoverDate && props.contact.has_requested_takeover;
})

const onDenyEmergencyAccessRequest = async () => {
    try {
        await denyEmergencyAccessRequest();
        displayNotification("Emergency access denied", `Emergency access for contact ${props.contact.email} has been denied successfully`, UINotificationType.Success)
        emit('on-contacts-changed');
    } catch (error) {
        displayNotificationFromError(error)
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

const denyEmergencyAccessRequest = async () => {
    const enclaveApiClient = useEnclave();
    await enclaveApiClient.denyEmergencyContactAccessRequest(props.contact.email)
}

const onRemoveEmergencyContact = async () => {
    try {
        await removeEmergencyContact();
        displayNotification("Emergency contact removed", `Emergency contact ${props.contact.email} has been removed successfully`, UINotificationType.Success)
        emit('on-contacts-changed');
    } catch (error) {
        displayNotificationFromError(error)
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

const removeEmergencyContact = async () => {
    const enclaveApiClient = useEnclave();
    await enclaveApiClient.removeEmergencyContact(props.contact.email)
}
</script>