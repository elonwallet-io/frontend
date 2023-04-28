import { User } from "~/lib/types";
import { HttpError, HttpErrorType } from "~~/lib/HttpError";

export default function () {
    const backendJWT = useBackendJWT();
    const backendApiClient = useBackend();
    const { displayNotificationFromError } = useNotification();

    const { data: contacts, error: contactsError, refresh } = useAsyncDataWithCache<User[]>("contacts", async () => {
        return await backendApiClient.getContacts(backendJWT.value);
    });

    watch(contactsError, () => {
        if (contactsError.value) {
            displayNotificationFromError(contactsError.value);
            if (contactsError.value instanceof HttpError && contactsError.value.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
        }
    });

    return {
        contacts,
        refresh
    }
}