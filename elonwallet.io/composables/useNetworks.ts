import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { Network } from "~~/lib/types";

export default function () {
    const { enclaveApiClient } = useApi();
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

    const { data: networks, error, refresh } = useLazyAsyncDataWithCache<Network[]>("networks", async () => {
        return await enclaveApiClient.getNetworks();
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
        networks,
        refresh
    }
}