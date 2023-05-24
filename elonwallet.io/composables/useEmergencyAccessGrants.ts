import { HttpError, HttpErrorType } from "~/lib/HttpError";
import { EmergencyAccessGrant } from "~/lib/types";

export default function () {
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();

    const { data: emergencyAccessGrants, error, refresh } = useAsyncData<EmergencyAccessGrant[]>("emergency-access-grants", async () => {
        return await enclaveApiClient.getEmergencyAccessGrants();
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
        emergencyAccessGrants,
        refresh
    }
}