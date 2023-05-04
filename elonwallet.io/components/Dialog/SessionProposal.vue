<template>
    <div>
        <v-dialog v-model="dialog" persistent>
            <div class="p-4 flex flex-col w-2/6 bg-white m-auto">
                <div class="flex justify-center">
                    <h2 class="text-2xl font-bold">Session Proposal</h2>
                </div>
                <WalletConnectProjectInfoCard :metadata="requestEvent.params.proposer.metadata" />
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="text-xl font-extrabold">Required Namespaces</h3>
                <h3 class="font-bold text-xl">Chains</h3>
                <p class="ml-2">{{ requiredChainNames }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Methods</h3>
                <p class="ml-2">{{ requiredMethods }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Events</h3>
                <p class="ml-2">{{ requiredEvents }}</p>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <v-select variant="plain" v-model="chosenWallets" :items="wallets?.map(w => w.name)"
                    label="Choose your wallets" multiple chips></v-select>
                <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                <h3 class="font-bold text-xl">Optional Namespaces</h3>
                <div v-if="requestEvent.params.optionalNamespaces.eip155">
                    <h3 class="font-bold text-xl">Chains</h3>
                    <p class="ml-2">{{ optionalChainNames }}</p>
                    <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                    <h3 class="font-bold text-xl">Methods</h3>
                    <p class="ml-2">{{ optionalMethods }}</p>
                    <div class="flex-grow border-t-2 border-custom-light-blue opacity-30 my-3"></div>
                    <h3 class="font-bold text-xl">Events</h3>
                    <p class="ml-2">{{ optionalEvents }}</p>
                    <v-switch color="primary" v-model="allowOptional" label="Allow optional namespaces?" />
                </div>
                <p v-else>0</p>
                <div class="flex justify-end">
                    <v-btn variant="text" color="primary" @click="onReject">Reject</v-btn>
                    <v-btn variant="text" color="primary" @click="onApprove">Approve</v-btn>
                </div>
            </div>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { SignClientTypes } from '@walletconnect/types';
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Wallet } from '~/lib/types'

const dialog = ref(true);
const emit = defineEmits(['response'])
const { networks } = useNetworks();
const { wallets } = useWallets();
const currentWallet = useCurrentWallet();
const allowedWallets = ref<Wallet[]>([currentWallet.value]);
const allowOptional = ref(false);


const props = defineProps<{
    requestEvent: SignClientTypes.EventArguments['session_proposal'],
}>();


const requiredChainNames = computed(() => {
    const chainHex = props.requestEvent.params.requiredNamespaces.eip155.chains?.map(c => {
        const stripped = c.replace("eip155:", "");
        const chainInt = parseInt(stripped, 10);
        return `0x${chainInt.toString(16)}`
    }) ?? [];


    return networks.value?.filter(n => chainHex.includes(n.chain)).map(n => n.name).join(", ");
})

const requiredMethods = computed(() => {
    return props.requestEvent.params.requiredNamespaces.eip155.methods.join(", ");
})

const requiredEvents = computed(() => {
    return props.requestEvent.params.requiredNamespaces.eip155.events.join(", ");
})

const optionalChainNames = computed(() => {
    const chainHex = props.requestEvent.params.optionalNamespaces.eip155?.chains?.map(c => {
        const stripped = c.replace("eip155:", "");
        const chainInt = parseInt(stripped, 10);
        return `0x${chainInt.toString(16)}`
    }) ?? [];


    return networks.value?.filter(n => chainHex.includes(n.chain)).map(n => n.name).join(", ");
})

const optionalMethods = computed(() => {
    return props.requestEvent.params.optionalNamespaces.eip155?.methods.join(", ");
})

const optionalEvents = computed(() => {
    return props.requestEvent.params.optionalNamespaces.eip155?.events.join(", ");
})

const chosenWallets = computed({
    get() {
        return allowedWallets.value.map(w => w.name);
    },
    set(newValue) {
        allowedWallets.value = wallets.value!.filter(w => newValue.includes(w.name));
    }
});

const approvedChains = computed(() => {
    const nets = networks.value?.filter(n => {
        return requiredChainNames.value?.includes(n.name) || (allowOptional.value && optionalChainNames.value?.includes(n.name))
    })

    return nets?.map(n => `eip155:${parseInt(n.chain, 16)}`) ?? []
})

const approvedWallets = computed(() => {
    const w = new Array<string>();

    for (const wallet of allowedWallets.value ?? []) {
        for (const network of approvedChains.value) {
            w.push(`${network}:${wallet.address}`);
        }
    }
    return w;
})

const onClose = (responseType: "approve" | "reject", response: any) => {
    dialog.value = false;
    emit('response', responseType, response);
}

const onReject = async () => {
    const error = getSdkError('USER_REJECTED')
    const response = {
        id: props.requestEvent.id,
        reason: error
    };

    onClose("reject", response);
}

const onApprove = async () => {
    const approvedNamespaces = buildApprovedNamespaces({
        proposal: props.requestEvent.params,
        supportedNamespaces: {
            eip155: {
                chains: approvedChains.value,
                methods: ["personal_sign", "eth_sendTransaction", "eth_signTransaction", "eth_signTypedData", "eth_sign"],
                events: ["accountsChanged", "chainChanged"],
                accounts: approvedWallets.value
            },
        },
    });
    console.log(approvedNamespaces);

    const response = {
        id: props.requestEvent.id,
        namespaces: approvedNamespaces
    };

    onClose("approve", response);
}

</script>