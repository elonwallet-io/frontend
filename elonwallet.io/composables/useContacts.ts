import { User } from "~/lib/types";
import { HttpError, HttpErrorType } from "~~/lib/HttpError";

export default function () {
    const backendJWT = useBackendJWT();
    const backendApiClient = useBackend();
    const { displayNotificationFromError } = useNotification();

    const { data: contacts, error, refresh } = useAsyncDataWithCache<User[]>("contacts", async () => {
        return await backendApiClient.getContacts(backendJWT.value);
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
        contacts,
        refresh
    }
}