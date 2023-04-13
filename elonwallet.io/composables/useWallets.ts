import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Wallet } from "~~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

    const { data: wallets, error, refresh } = useAsyncDataWithCache<Wallet[]>("wallets", async () => {
        return await enclaveApiClient.getWallets();
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
        wallets,
        refresh
    }
}