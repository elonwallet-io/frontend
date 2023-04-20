import { HttpError, HttpErrorType } from "~/lib/HttpError";

export default function () {
    const { displayNetworkErrorNotification, displayNotificationFromHttpError } = useNotification();

    const handleError = async (hook: () => any) => {
        try {
            await hook();
        } catch (error) {
            if (error instanceof HttpError) {
                displayNotificationFromHttpError(error);
                if (error.type === HttpErrorType.Unauthorized) {
                    navigateTo("/login")
                }
            } else {
                displayNetworkErrorNotification();
            }
        }
    }

    return handleError;
}