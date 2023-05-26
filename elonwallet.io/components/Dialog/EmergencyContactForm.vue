<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <template v-slot:activator="{ props }">
                <v-btn variant="text" color="primary" v-bind="props">
                    + Add Emergency Contact
                </v-btn>
            </template>
            <div class="p-4 flex flex-col w-2/6 bg-white m-auto">
                <h3 class="text-xl">Add a new Emergency Contact</h3>
                <v-form ref="emergencyContactForm" validate-on="blur" class="flex flex-col gap-2 mt-4" @submit.prevent>
                    <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Emergency contact email" />
                    <v-text-field variant="solo" v-model="waitingPeriodInDays" :rules="waitingPeriodInDaysRules"
                        label="Waiting period in days" />
                    <div class="flex justify-end">
                        <v-btn variant="text" color="primary" @click="onDiscard">Discard</v-btn>
                        <v-btn variant="text" color="primary" @click="onSave">Save</v-btn>
                    </div>
                </v-form>
            </div>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { isGreaterThan, isLessThan } from '~/lib/VuetifyValidationRules';
import { isRequired, isEmail, isUnique, isValidNumber } from '~/lib/VuetifyValidationRules';
import { EmergencyAccessContact, UINotificationType } from '~~/lib/types';

const props = defineProps<{
    emergencyContacts: EmergencyAccessContact[]
}>();

const emit = defineEmits(['contact-created'])
const { displayNotificationFromError, displayNotification } = useNotification();
const dialog = ref(false);
const backendJWT = useBackendJWT();
const backendApiClient = useBackend();
const emergencyContactForm = ref();
const emergencyContactEmails = computed(() => props.emergencyContacts.map(item => item.email))
const ownEmail = useEmail();
const email = ref("");
const emailRules = [
    isRequired("Email"),
    isEmail(),
    isUnique("Contact", emergencyContactEmails),
    async (value: string) => {
        if (!/.+@.+\..+/.test(value)) return false

        try {
            await backendApiClient.getUser(value, backendJWT.value);
        } catch (error) {
            if (error instanceof HttpError) {
                if (error.type == HttpErrorType.NotFound) {
                    return 'User not found'
                }
            }
        }

        return true
    },
    (value: string) => {
        if (value !== ownEmail.value) return true
        return "You cannot add yourself as an emergency contact"
    }
];
watchEffect(() => {
    if (email.value) {
        email.value = email.value.trim();
    }
})

const waitingPeriodInDays = ref("");
const waitingPeriodInDaysRules = [
    isRequired("Waiting Period"),
    isValidNumber("Waiting Period"),
    isGreaterThan("Waiting Period", 6),
    isLessThan("Waiting Period", 100),
];
watchEffect(() => {
    if (waitingPeriodInDays.value) {
        waitingPeriodInDays.value = waitingPeriodInDays.value.trim();
    }
})


const onDiscard = async () => {
    emergencyContactForm.value.reset();
    dialog.value = false;
}

const onSave = async () => {
    const { valid } = await emergencyContactForm.value.validate();
    if (!valid)
        return;

    try {
        await createEmergencyContact(email.value, parseInt(waitingPeriodInDays.value!));
        dialog.value = false;
        displayNotification("Emergency Contact created", `${email.value} has been added to your emergency contacts successfully`, UINotificationType.Success);
        emergencyContactForm.value.reset();
        emit("contact-created")
    } catch (error) {
        displayNotificationFromError(error);
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
};

const createEmergencyContact = async (email: string, waitingPeriodInDays: number) => {
    const enclaveApiClient = useEnclave();

    await enclaveApiClient.createEmergencyContact(email, waitingPeriodInDays)
}

</script>