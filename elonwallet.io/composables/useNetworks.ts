import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Network } from "~~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: networks, error, refresh } = useAsyncDataWithCache<Network[]>("networks", async () => {
        return await enclaveApiClient.getNetworks();
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
        networks,
        refresh
    }
}