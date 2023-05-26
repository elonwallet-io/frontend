<template>
    <div>
        <nav class="flex gap-2">
            <NuxtLink to="/walletconnect">
                <v-btn variant="text" class="text-none text-white">
                    <div class="flex gap-2">
                        <img src="~/assets/img/wallet-connect-logo.svg" class="h-4 w-4" />
                        WalletConnect
                    </div>
                </v-btn>
            </NuxtLink>
            <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                    <v-btn variant="text" class="text-none text-white" v-bind="props">
                        <div class="flex gap-2">
                            <img src="~/assets/img/gear-solid.svg" class="h-4 w-4" />
                            <span>Settings</span>
                        </div>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item v-for="(setting, index) in settings" :key="index" :value="index"
                        @click="onClickSetting(setting)">
                        {{ setting.name }}
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn variant="text" @click="onLogout" class="text-none text-white">
                <div class="flex gap-2">
                    <img src="~/assets/img/arrow-right-from-bracket-solid.svg" class="h-4 w-4" />
                    Logout
                </div>
            </v-btn>
        </nav>
    </div>
</template>

<script setup lang="ts">
const { displayNotificationFromError } = useNotification();

interface Setting {
    name: string,
}

const settings = ref([
    { name: "Emergency Contacts" },
    { name: "Credentials" }
])

const onClickSetting = (setting: Setting) => {
    switch (setting.name) {
        case "Emergency Contacts":
            navigateTo("/emergency-contacts")
            break;
        case "Credentials":
            navigateTo("/credentials")
            break;
    }
}

const onLogout = async () => {
    try {
        const enclaveApiClient = useEnclave();
        await enclaveApiClient.logout();
        clearNuxtData();
        localStorage.clear();
        navigateTo("/login")
    }
    catch (error) {
        displayNotificationFromError(error);
    }
    navigateTo("/login")
}
</script>