import { HttpError, HttpErrorType } from "~/lib/HttpError";

export default function () {
    const backendJWT = useBackendJWT();
    const backendApiClient = useBackend();
    const { displayNotificationFromError } = useNotification();
    const network = useCurrentNetwork();
    const wallet = useCurrentWallet();

    const { data: balance, error, refresh } = useAsyncDataWithCache<string>("balance", async () => {
        return await backendApiClient.getBalance(wallet.value.address, network.value.chain, backendJWT.value);
    });

    watch(error, () => {
        if (error.value) {
            displayNotificationFromError(error);
            if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        }
    });

    return {
        balance,
        refresh
    }
}