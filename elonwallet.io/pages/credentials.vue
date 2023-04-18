<template>
    <div v-if="credentials" class="flex flex-col items-center mt-20">
        <div class="w-1/2 p-2 bg-white shadow-md rounded-md">
            <div class="flex justify-between items-center">
                <span class="font-bold">My Credentials</span>
                <DialogCredentialForm :credentials="credentials" @credential-created="refresh()" />
            </div>
            <v-list :lines="false">
                <v-list-item v-for="credential in credentials" :key="credential.name" class="border mx-4 my-2">
                    <div class="flex justify-between">
                        <div class="flex gap-2 items-center">
                            <img src="~/assets/img/key-solid.svg" class="h-5 w-5 m-1" />
                            <span>{{ credential.name }}
                                <span class="opacity-50">{{ credential.currently_used ? `(current)` : '' }}</span>
                            </span>
                        </div>
                        <v-btn :disabled="credential.currently_used" variant="plain" @click="onClickDelete(credential)">
                            <img src="~/assets/img/trash-can-regular.svg" class="h-5 w-5 m-1" />
                        </v-btn>
                    </div>
                </v-list-item>
            </v-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import { HttpError, HttpErrorType } from '~~/lib/HttpError';
import { WebauthnCredential } from '~~/lib/types';
const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();
const enclaveApiClient = useEnclave();

const { data: credentials, error, refresh } = useAsyncDataWithCache<WebauthnCredential[]>('credentials', async () => {
    return await enclaveApiClient.getCredentials();
})

watch(error, () => {
    if (error.value) {
        if (error.value instanceof HttpError) {
            if (error.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            } else if (error.value.type == HttpErrorType.Forbidden) {
                navigateTo("/reauthenticate?redirect=%2Fcredentials")
            } else {
                displayNotificationFromHttpError(error.value);
            }
        } else {
            displayNetworkErrorNotification();
        }
    }
})

const onClickDelete = async (credential: WebauthnCredential) => {
    try {
        await enclaveApiClient.removeCredential(credential.name);
    } catch (err) {
        if (err instanceof HttpError) {
            if (err.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            } else if (err.type == HttpErrorType.Forbidden) {
                navigateTo("/reauthenticate?redirect=%2Fcredentials")
            } else {
                displayNotificationFromHttpError(err);
            }
        } else {
            displayNetworkErrorNotification();
        }
    }

    credentials.value = credentials.value!.filter(item => item.name !== credential.name)
}
</script>