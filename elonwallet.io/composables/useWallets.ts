import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Wallet } from "~~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: wallets, error, refresh } = useAsyncDataWithCache<Wallet[]>("wallets", async () => {
        return await enclaveApiClient.getWallets();
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
        wallets,
        refresh
    }
}