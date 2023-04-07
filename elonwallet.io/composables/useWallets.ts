import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Wallet } from "~~/lib/types";
import useLazyAsyncDataWithCache from "./useLazyAsyncDataWithCache";

export default function () {
    const { enclaveApiClient } = useApi();
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

    const { data: wallets, error, refresh } = useLazyAsyncDataWithCache<Wallet[]>("wallets", async () => {
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