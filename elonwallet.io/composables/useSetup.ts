export default function () {
    const wallet = useCurrentWallet();
    const network = useCurrentNetwork();

    const email = useEmail();
    const backendJWT = useBackendJWT();
    const enclaveURL = useEnclaveURL();
    const preSetupFinished = ref(false);

    onBeforeMount(() => {
        email.value = localStorage.getItem('email')!;
        backendJWT.value = localStorage.getItem('backend_jwt')!;
        enclaveURL.value = localStorage.getItem('enclave_url')!;

        if (!email.value || !backendJWT.value || !enclaveURL.value) {
            navigateTo("/login")
        }

        preSetupFinished.value = true;
    })

    const unwatchPreSetup = watch(preSetupFinished, () => {
        const { wallets } = useWallets();
        const { networks } = useNetworks();

        const unwatchNetworks = watch(networks, () => {
            if (networks.value) {
                network.value = networks.value[0]!;
                unwatchNetworks();
            }
        });

        const unwatchWallets = watch(wallets, () => {
            if (wallets.value) {
                wallet.value = wallets.value[0]!;
                unwatchWallets();
            }
        });

        unwatchPreSetup();
    })


    const ready = computed(() => {
        return !!(wallet.value && network.value)
    })

    return ready
}