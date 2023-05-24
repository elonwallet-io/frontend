<template>
    <div class="m-auto flex flex-col justify-center w-1/2 mt-4">
        <WalletConnectQrReader @on-qr-code-scanned="connect" />
        <div class="flex py-5 items-center w-full">
            <div class="flex-grow border-t-2 border-custom-light-blue opacity-30"></div>
            <span class="flex-shrink mx-4 text-custom-light-blue opacity-80">or</span>
            <div class="flex-grow border-t-2 border-custom-light-blue opacity-30"></div>
        </div>
        <v-form ref="form" validate-on="blur" @submit.prevent>
            <v-text-field variant="solo" v-model="uri" :rules="uriRules" label="WalletConnect URI" />
            <v-btn type="submit" variant="elevated" color="primary" block @click="onConnect">Connect</v-btn>
        </v-form>
        <DialogSignMessage v-if="viewEvents.view === WcViews.SignMessage" :request-event="viewEvents.data!.requestEvent"
            :request-session="viewEvents.data!.requestSession" @response="onRespondSessionRequest" />
        <DialogSignTypedData v-else-if="viewEvents.view === WcViews.SignTypedData"
            :request-event="viewEvents.data!.requestEvent" :request-session="viewEvents.data!.requestSession"
            @response="onRespondSessionRequest" />
        <DialogSendTransaction v-else-if="viewEvents.view === WcViews.SendTransaction"
            :request-event="viewEvents.data!.requestEvent" :request-session="viewEvents.data!.requestSession"
            @response="onRespondSessionRequest" />
        <DialogSignTransaction v-else-if="viewEvents.view === WcViews.SignTransaction"
            :request-event="viewEvents.data!.requestEvent" :request-session="viewEvents.data!.requestSession"
            @response="onRespondSessionRequest" />
        <DialogSessionProposal v-else-if="viewEvents.view === WcViews.SessionProposal" :request-event="viewEvents.proposal!"
            @response="onRespondSessionProposal" />
    </div>
</template>

<script setup lang="ts">
import { isRequired } from '~/lib/VuetifyValidationRules';
import { WcViews } from '~/lib/types';

const form = ref();
const uri = ref("");
const uriRules = [
    isRequired("WalletConnect URI"),
];

const { connect, viewEvents, onRespondSessionRequest, onRespondSessionProposal } = useWalletConnect();

const onConnect = async () => {
    const { valid } = await form.value.validate();
    if (!valid)
        return;
    connect(uri.value);
}
</script>