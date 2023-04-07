import { User } from "~/lib/types";
import { HttpError, HttpErrorType } from "~~/lib/HttpError";

export default function () {
    const { backendApiClient } = useApi();
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

    const { data: contacts, error, refresh } = useLazyAsyncDataWithCache<User[]>("contacts", async () => {
        return await backendApiClient.getContacts();
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