import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Wallet } from "~~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: wallets, error, refresh } = useAsyncDataWithCache<Wallet[]>("wallets", async () => {
        return await enclaveApiClient.getWallets();
    });

    watchEffect(() => {
        if (error.value) {
            displayNotificationFromError(error.value);
            if (error.value instanceof HttpError && error.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        }
    });

    return {
        wallets,
        refresh
    }
}