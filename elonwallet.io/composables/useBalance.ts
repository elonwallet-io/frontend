import { HttpError, HttpErrorType } from "~/lib/HttpError";

export default function () {
    const backendJWT = useBackendJWT();
    const backendApiClient = useBackend();
    const { displayNotificationFromError } = useNotification();
    const network = useCurrentNetwork();
    const wallet = useCurrentWallet();

    const { data: balance, error: balanceError, refresh } = useAsyncDataWithCache<string>("balance", async () => {
        return await backendApiClient.getBalance(wallet.value.address, network.value.chain, backendJWT.value);
    });

    watch(balanceError, () => {
        if (balanceError.value) {
            displayNotificationFromError(balanceError.value);
            if (balanceError.value instanceof HttpError && balanceError.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        }
    });

    return {
        balance,
        refresh
    }
}