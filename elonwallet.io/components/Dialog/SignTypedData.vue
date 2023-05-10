<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <div class="p-4 flex flex-col w-2/6 bg-white m-auto">
                <div class="flex justify-center">
                    <h2 class="text-2xl font-bold">Sign Typed Data</h2>
                </div>
                <WalletConnectProjectInfoCard :metadata="requestSession.peer.metadata" />
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Wallet</h3>
                <p class="ml-2">{{ wallet }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Blockchain</h3>
                <p class="ml-2">{{ chainName }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Data</h3>
                <p class="ml-2">{{ signingParams.typedData }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Method</h3>
                <p class="ml-2">{{ requestEvent.params.request.method }}</p>
                <div class="flex justify-end">
                    <v-btn variant="text" color="primary" @click="onReject">Reject</v-btn>
                    <v-btn variant="text" color="primary" @click="onApprove">Approve</v-btn>
                </div>
            </div>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { extractTypedDataAndSigner } from '~/lib/WalletConnectUtils';
import { getSdkError } from "@walletconnect/utils";
import { JsonRpcResponse } from "@walletconnect/jsonrpc-utils";
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { SignTypedData } from '~/lib/types';
const { displayNotificationFromError } = useNotification();

const dialog = ref(true);
const emit = defineEmits(['response'])
const { networks } = useNetworks();
const { wallets } = useWallets();

const props = defineProps<{
    requestEvent: SignClientTypes.EventArguments['session_request'],
    requestSession: SessionTypes.Struct
}>();

const onClose = (response: JsonRpcResponse) => {
    dialog.value = false;
    emit('response', response, props.requestEvent);
}

const chainName = computed(() => {
    const chainID = parseInt(props.requestEvent.params.chainId.replace("eip155:", ""), 10)
    return networks.value?.find(n => n.chain_id === chainID)?.name;
})

const signingParams = computed(() => {
    return extractTypedDataAndSigner(props.requestEvent.params.request.params);
})

const wallet = computed(() => {
    return wallets.value?.find(w => w.address === signingParams.value.address)?.name
})

const onReject = async () => {
    const error = getSdkError('USER_REJECTED')
    const response = {
        id: props.requestEvent.id,
        jsonrpc: '2.0',
        error: error
    };

    onClose(response);
}

const onApprove = async () => {
    try {
        const signature = await signTypedData(signingParams.value.typedData, signingParams.value.address);
        const response = {
            id: props.requestEvent.id,
            jsonrpc: '2.0',
            result: signature
        }
        onClose(response);
    } catch (error) {
        displayNotificationFromError(error);
        const rpcErr = getSdkError('USER_REJECTED')
        const response = {
            id: props.requestEvent.id,
            jsonrpc: '2.0',
            error: rpcErr
        };
        onClose(response);
        if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
            navigateTo("/login")
        }
    }
}

const signTypedData = async (typedData: SignTypedData, from: string) => {
    const enclaveApiClient = useEnclave();
    const signature = await enclaveApiClient.signTypedData(typedData, from);
    return signature;
}
</script>