import { HttpError, HttpErrorType } from "~/lib/HttpError";

export default function () {
    const backendJWT = useBackendJWT();
    const backendApiClient = useBackend();
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();
    const network = useCurrentNetwork();
    const wallet = useCurrentWallet();

    const { data: balance, error, refresh } = useAsyncDataWithCache<string>("balance", async () => {
        return await backendApiClient.getBalance(wallet.value.address, network.value.chain, backendJWT.value);
    });

    watch(error, () => {
        if (error.value) {
            if (error.value instanceof HttpError) {
                displayNotificationFromHttpError(error.value);
                if (error.value.type === HttpErrorType.Unauthorized) {
                    navigateTo("/login")
                }
            } else {
                displayNetworkErrorNotification();
            }
        }
    });

    return {
        balance,
        refresh
    }
}