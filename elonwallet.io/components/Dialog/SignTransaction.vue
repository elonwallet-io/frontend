<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <div class="p-4 flex flex-col w-2/6 bg-white m-auto">
                <div class="flex justify-center">
                    <h2 class="text-2xl font-bold">Sign Transaction</h2>
                </div>
                <WalletConnectProjectInfoCard :metadata="requestSession.peer.metadata" />
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Wallet</h3>
                <p class="ml-2">{{ wallet }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Blockchain</h3>
                <p class="ml-2">{{ chainName }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Transaction Data</h3>
                <p class="ml-2">{{ txViewable }}</p>
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
import { getSdkError } from "@walletconnect/utils";
import { JsonRpcResponse } from "@walletconnect/jsonrpc-utils";
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { TransactionParams } from '~/lib/types';
const { displayNotificationFromError } = useNotification();
import { solveLoginChallenge } from '~/lib/webauthn';

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

const chainHex = computed(() => {
    const chainInt = parseInt(props.requestEvent.params.chainId.replace("eip155:", ""), 10)
    return `0x${chainInt.toString(16)}`
})

const chainName = computed(() => {
    return networks.value?.find(n => n.chain_id_hex === chainHex.value)?.name;
})

const tx = computed((): TransactionParams => {
    const rawTx = props.requestEvent.params.request.params[0];

    return {
        type: rawTx.type ?? (rawTx.gasPrice ? "0x1" : "0x2"),
        from: rawTx.from,
        to: rawTx.to,
        input: rawTx.data,
        gas: rawTx.gasLimit,
        gasPrice: rawTx.gasPrice,
        maxFeePerGas: rawTx.maxFeePerGas,
        maxPriorityFeePerGas: rawTx.maxPriorityFeePerGas,
        nonce: rawTx.nonce,
        value: rawTx.value,
        accessList: rawTx.accessList,
        chainId: rawTx.chainId ?? chainHex.value,
    }
})

const txViewable = computed((): TransactionParams => {
    if (tx.value.type === "0x1") {
        return {
            type: tx.value.type,
            from: tx.value.from,
            to: tx.value.to,
            input: tx.value.input,
            gas: BigInt(tx.value.gas ?? "").toString(),
            gasPrice: BigInt(tx.value.gasPrice ?? "").toString(),
            nonce: BigInt(tx.value.nonce ?? "").toString(),
            value: BigInt(tx.value.value ?? "").toString(),
            accessList: tx.value.accessList,
        }
    } else {
        return {
            type: tx.value.type,
            from: tx.value.from,
            to: tx.value.to,
            input: tx.value.input,
            gas: BigInt(tx.value.gas ?? "").toString(),
            maxFeePerGas: BigInt(tx.value.maxFeePerGas ?? "").toString(),
            maxPriorityFeePerGas: BigInt(tx.value.maxPriorityFeePerGas ?? "").toString(),
            nonce: BigInt(tx.value.nonce ?? "").toString(),
            value: BigInt(tx.value.value ?? "").toString(),
            accessList: tx.value.accessList,
            chainId: tx.value.chainId,
        }
    }
})

const wallet = computed(() => {
    return wallets.value?.find(w => w.address === tx.value.from)?.name
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
        const signedTx = await signTransaction(tx.value);
        const response = {
            id: props.requestEvent.id,
            jsonrpc: '2.0',
            result: signedTx
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

const signTransaction = async (tx: TransactionParams) => {
    const enclaveApiClient = useEnclave();
    const options = await enclaveApiClient.signTransactionInitialize();
    const credential = await solveLoginChallenge(options);
    const payload = {
        assertion_response: credential,
        transaction_params: tx
    }

    const signedTx = await enclaveApiClient.signTransactionFinalize(payload)
    return signedTx;
}
</script>