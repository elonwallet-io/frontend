import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Wallet } from "~~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: wallets, error: walletsError, refresh } = useAsyncDataWithCache<Wallet[]>("wallets", async () => {
        return await enclaveApiClient.getWallets();
    });

    watch(walletsError, () => {
        if (walletsError.value) {
            displayNotificationFromError(walletsError.value);
            if (walletsError.value instanceof HttpError && walletsError.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        }
    });

    return {
        wallets,
        refresh
    }
}