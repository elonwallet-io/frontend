import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Network } from "~~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: networks, error: networksError, refresh } = useAsyncDataWithCache<Network[]>("networks", async () => {
        return await enclaveApiClient.getNetworks();
    });

    watch(networksError, () => {
        if (networksError.value) {
            displayNotificationFromError(networksError.value);
            if (networksError.value instanceof HttpError && networksError.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        }
    });

    return {
        networks,
        refresh
    }
}