<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <template v-slot:activator="{ props }">
                <v-btn variant="text" color="primary" v-bind="props">
                    + Add Webauthn Credential
                </v-btn>
            </template>
            <div class="p-4 flex flex-col w-2/6 bg-white m-auto">
                <h3 class="text-xl">Add a new Credential</h3>
                <v-switch class="mt-2" label="My credential is on another device" color="primary" v-model="external"
                    hide-details />
                <CredentialsLocalForm v-if="!external" :credentials="credentials" @credential-created="onCredentialCreated"
                    @discard="onClose" />
                <CredentialsExternalForm v-else :credentials="credentials" @authorize="onClose" @discard="onClose" />
            </div>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { WebauthnCredential } from '~~/lib/types';

const external = ref(false)
const dialog = ref(false);

defineProps<{
    credentials: WebauthnCredential[]
}>();

const emit = defineEmits(['credential-created'])

const onCredentialCreated = () => {
    emit('credential-created');
    onClose();
}

const onClose = () => {
    dialog.value = false;
    external.value = false;
}

</script>