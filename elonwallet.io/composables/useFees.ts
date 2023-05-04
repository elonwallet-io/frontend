import { HttpError, HttpErrorType } from "~/lib/HttpError";
import { Fees } from "~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();
    const network = useCurrentNetwork();

    const { data: fees, error, refresh } = useAsyncDataWithCache<Fees>("fees", async () => {
        return await enclaveApiClient.getFees(network.value.chain);
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
        fees,
        refresh
    }
}