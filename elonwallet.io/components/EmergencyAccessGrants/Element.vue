<template>
    <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
            <img src="~/assets/img/user-regular.svg" class="h-7 w-7 m-1" />
            <p>{{ grant.email }} </p>
        </div>
        <p v-if="!grant.has_accepted" class="opacity-60">Invitation pending</p>
        <p v-else-if="takeoverWaitPeriodExpired" class="text-green-500">Takeover grace period expired</p>
        <p v-else-if="grant.has_requested_takeover" class="text-amber-500">Takeover pending until {{ takeoverDate }}</p>
        <div v-if="!grant.has_accepted">
            <v-btn variant="plain" @click="onRespondGrantInvitation(true)" size="small">
                <img src="~/assets/img/check-solid.svg" class="h-5 w-5" title="Accept invitation" />
            </v-btn>
            <v-btn variant="plain" @click="onRespondGrantInvitation(false)" size="small">
                <img src="~/assets/img/ban-solid.svg" class="h-5 w-5" title="Deny invitation" />
            </v-btn>
        </div>
        <div v-else-if="takeoverWaitPeriodExpired">
            <v-btn variant="plain" @click="onRequestEmergencyAccessTakeover()" size="small">
                <img src="~/assets/img/key-solid.svg" class="h-5 w-5" title="Request account takeover" />
            </v-btn>
        </div>
        <div v-else-if="grant.has_requested_takeover">
            <v-btn disabled variant="plain" @click="onRequestEmergencyAccessTakeover()" size="small">
                <img src="~/assets/img/key-solid.svg" class="h-5 w-5" title="Request account takeover" />
            </v-btn>
        </div>
        <div v-else>
            <v-btn variant="plain" @click="onRequestEmergencyAccess()" size="small">
                <img src="~/assets/img/key-solid.svg" class="h-5 w-5" title="Request emergency access" />
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { EmergencyAccessGrant, UINotificationType } from '~/lib/types';
const { displayNotification, displayNotificationFromError } = useNotification();

const props = defineProps<{
    grant: EmergencyAccessGrant
}>();

const emit = defineEmits(['on-grants-changed'])

const takeoverDate = computed(() => {
    const date = new Date(props.grant.takeover_allowed_after * 1000);
    return date.toLocaleString();
})

const takeoverWaitPeriodExpired = computed(() => {
    const current = new Date();
    const takeoverDate = new Date(props.grant.takeover_allowed_after * 1000);
    return current > takeoverDate && props.grant.has_requested_takeover;
})

const onRespondGrantInvitation = async (accept: boolean) => {
    try {
        await respondGrantInvitation(accept);
        emit('on-grants-changed');
    } catch (error) {
        displayNotificationFromError(error)
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

const respondGrantInvitation = async (accept: boolean) => {
    const enclaveApiClient = useEnclave();
    await enclaveApiClient.respondEmergencyAccessGrantInvitation(props.grant.email, accept);
}

const onRequestEmergencyAccess = async () => {
    try {
        await requestEmergencyAccess();
        displayNotification("Emergency Access requested", `You have successfully requested emergency access to the account of ${props.grant.email}`, UINotificationType.Success)
        emit('on-grants-changed');
    } catch (error) {
        displayNotificationFromError(error)
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

const requestEmergencyAccess = async () => {
    const enclaveApiClient = useEnclave();
    await enclaveApiClient.requestEmergencyAccess(props.grant.email)
}

const onRequestEmergencyAccessTakeover = async () => {
    try {
        await takeoverAccount();
        displayNotification("Account has been taken over", `You have successfully taken over the account of ${props.grant.email}`, UINotificationType.Success)
        await refreshNuxtData("wallets");
        emit('on-grants-changed');
    } catch (error) {
        displayNotificationFromError(error)
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

const takeoverAccount = async () => {
    const enclaveApiClient = useEnclave();
    await enclaveApiClient.requestEmergencyAccessTakeover(props.grant.email)
}
</script>