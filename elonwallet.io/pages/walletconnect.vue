<template>
    <div class="m-auto flex flex-col justify-center w-1/2">
        <div class="flex py-5 items-center w-full">
            <div class="flex-grow border-t-2 border-custom-light-blue opacity-30"></div>
            <span class="flex-shrink mx-4 text-custom-light-blue opacity-80">or</span>
            <div class="flex-grow border-t-2 border-custom-light-blue opacity-30"></div>
        </div>
        <v-form class="mt-4" ref="form" @submit.prevent>
            <v-text-field variant="solo" v-model="uri" :rules="uriRules" label="WalletConnect URI" />
            <v-btn type="submit" variant="elevated" color="primary" block @click="onConnect">Connect</v-btn>
        </v-form>
    </div>
</template>

<script setup lang="ts">
import { isRequired } from '~/lib/VuetifyValidationRules';

const form = ref();
const uri = ref("");
const uriRules = [
    isRequired("WalletConnect URI"),
];

const { connect } = useWalletConnect();

const onConnect = async () => {
    const { valid } = await form.value.validate();
    if (!valid)
        return;
    console.log(uri.value)
    connect(uri.value);
}
</script>