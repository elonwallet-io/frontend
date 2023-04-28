import { HttpError, HttpErrorType } from "~/lib/HttpError";
import { Fees } from "~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();
    const network = useCurrentNetwork();

    const { data: fees, error: feesError, refresh } = useAsyncDataWithCache<Fees>("fees", async () => {
        return await enclaveApiClient.getFees(network.value.chain);
    });

    watch(feesError, () => {
        if (feesError.value) {
            displayNotificationFromError(feesError.value);
            if (feesError.value instanceof HttpError && feesError.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        }
    });

    return {
        fees,
        refresh
    }
}