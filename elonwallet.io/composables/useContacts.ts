import { User } from "~/lib/types";
import { HttpError, HttpErrorType } from "~~/lib/HttpError";

export default function () {
    const email = useEmail();
    const backendJWT = useBackendJWT();
    const backendApiClient = useBackend();
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

    const { data: contacts, error, refresh } = useAsyncDataWithCache<User[]>("contacts", async () => {
        return await backendApiClient.getContacts(email.value, backendJWT.value);
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
        contacts,
        refresh
    }
}