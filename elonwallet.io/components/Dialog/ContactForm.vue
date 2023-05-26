<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <template v-slot:activator="{ props }">
                <v-btn variant="text" color="primary" v-bind="props">
                    + Add contact
                </v-btn>
            </template>
            <div class="p-4 flex flex-col gap-4 w-2/6 bg-white m-auto">
                <span class="text-xl">Add a new Contact</span>
                <v-form ref="contactForm" validate-on="blur" @submit.prevent>
                    <v-text-field variant="solo" v-model="email" :rules="emailRules" label="Contact email address" />
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
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { UINotificationType, User } from '~~/lib/types';
import { isUnique, isRequired, isEmail } from '~/lib/VuetifyValidationRules';

const backendApiClient = useBackend();
const { displayNotificationFromError, displayNotification } = useNotification();

const props = defineProps<{
    contacts?: User[]
}>();

const backendJWT = useBackendJWT();
const ownEmail = useEmail();
const emit = defineEmits(['create-contact'])
const dialog = ref(false);
const contactForm = ref();
const contactEmails = computed(() => props.contacts?.map(item => item.email) ?? [])

const email = ref("");
const emailRules = [
    isRequired("Email"),
    isEmail(),
    isUnique("Contact", contactEmails),
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
        return "You cannot add yourself as a contact"
    }
];
watchEffect(() => {
    if (email.value) {
        email.value = email.value.trim();
    }
})

const onDiscard = async () => {
    contactForm.value.reset();
    dialog.value = false;
}

const onSave = async () => {
    const { valid } = await contactForm.value.validate();
    if (valid) {
        await onCreateContact(email.value);
    }
};

const onCreateContact = async (email: string) => {
    try {
        await backendApiClient.createContact(email, backendJWT.value);
        displayNotification("Contact added", `Contact ${email} has been added successfully`, UINotificationType.Success);
        dialog.value = false;
        contactForm.value.reset();
        emit("create-contact");
    } catch (error) {
        displayNotificationFromError(error);
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

</script>