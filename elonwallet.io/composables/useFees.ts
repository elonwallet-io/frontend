import { HttpError, HttpErrorType } from "~/lib/HttpError";
import { Fees } from "~/lib/types";

export default function () {
    const { enclaveApiClient } = useApi();
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();
    const network = useCurrentNetwork();

    const { data: fees, error, refresh } = useLazyAsyncDataWithCache<Fees>("fees", async () => {
        return await enclaveApiClient.getFees(network.value!.chain);
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
        fees,
        refresh
    }
}