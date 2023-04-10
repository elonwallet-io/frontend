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
                <v-form ref="contactForm" @submit.prevent>
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
import { User } from '~~/lib/types';

const { backendApiClient } = useApi();
const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

defineProps<{
    contacts?: User[]
}>();

const emit = defineEmits(['create-contact'])
const dialog = ref(false);
const contactForm = ref();
const email = ref<string>("");
const emailRules = [
    (value: string) => {
        if (value) return true

        return 'Email is required.'
    },
    (value: string) => {
        if (/.+@.+\..+/.test(value)) return true

        return 'Email must be valid.'
    },
    async (value: string) => {
        try {
            await backendApiClient.getUser(value);
        } catch (error) {
            if (error instanceof HttpError) {
                if (error.type == HttpErrorType.NotFound) {
                    return 'Email unknown'
                }
            }
        }

        return true
    }
];

const onDiscard = async () => {
    contactForm.value.reset();
    dialog.value = false;
}

const onSave = async () => {
    const { valid } = await contactForm.value.validate();
    if (valid) {
        await onCreateContact(email.value);
        emit("create-contact");
        contactForm.value.reset();
        dialog.value = false;
    }
};

const onCreateContact = async (email: string) => {
    try {
        await backendApiClient.createContact(email);
    } catch (error) {
        if (error instanceof HttpError) {
            displayNotificationFromHttpError(error);
            if (error.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        } else {
            displayNetworkErrorNotification();
        }
    }
}

</script>