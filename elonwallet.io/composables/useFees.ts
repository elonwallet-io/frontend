import { HttpError, HttpErrorType } from "~/lib/HttpError";
import { Fees } from "~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();
    const network = useCurrentNetwork();

    const { data: fees, error, refresh } = useAsyncDataWithCache<Fees>("fees", async () => {
        return await enclaveApiClient.getFees(network.value.chain);
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
        fees,
        refresh
    }
}