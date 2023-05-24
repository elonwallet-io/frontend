import { HttpError, HttpErrorType } from "~/lib/HttpError";
import { EmergencyAccessContact } from "~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: emergencyContacts, error, refresh } = useAsyncData<EmergencyAccessContact[]>("emergency-access-contacts", async () => {
        return await enclaveApiClient.getEmergencyContacts();
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
        emergencyContacts,
        refresh
    }
}