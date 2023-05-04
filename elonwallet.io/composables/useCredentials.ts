import { HttpError, HttpErrorType } from "~/lib/HttpError";
import { WebauthnCredential } from "~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: credentials, error, refresh } = useAsyncData<WebauthnCredential[]>("credentials", async () => {
        return await enclaveApiClient.getCredentials();
    });

    watchEffect(() => {
        if (error.value) {
            displayNotificationFromError(error.value);
            if (error.value instanceof HttpError) {
                if (error.value.type === HttpErrorType.Unauthorized) {
                    navigateTo("/login")
                } else if (error.value.type === HttpErrorType.Forbidden) {
                    navigateTo("/reauthenticate?redirect=%2Fcredentials")
                }
            }
            error.value = null;
        }
    });



    return {
        credentials,
        refresh
    }
}