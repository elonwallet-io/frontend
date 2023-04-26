import { HttpError, HttpErrorType } from "~~/lib/HttpError";
import { UINotification, UINotificationType } from "~~/lib/types";

export default function () {
    const notification = useState<UINotification | undefined>('notification');

    const displayNotification = (title: string, text: string, type: UINotificationType = UINotificationType.Error) => {
        notification.value = {
            title: title,
            text: text,
            type: type
        }
    }

    const displayNotificationFromError = (error: unknown) => {
        if (error instanceof HttpError) {
            displayHttpErrorNotificaton(error);
        } else {
            displayGenericErrorNotification();
        }
    }

    const displayHttpErrorNotificaton = (error: HttpError) => {
        switch (error.type) {
            case HttpErrorType.InternalServerError:
                displayNotification(
                    "Internal server error",
                    "The server has encountered an unknown error. Please try again later"
                );
                break;
            case HttpErrorType.Conflict:
                displayNotification(
                    "Resource already exists",
                    error.message
                )
                break;
            case HttpErrorType.NotFound:
                displayNotification(
                    "Resource does not exist",
                    error.message
                )
                break;
            case HttpErrorType.Forbidden:
                displayNotification(
                    "Re-Authentication needed",
                    "Please re-authenticate to access restricted resources",
                    UINotificationType.Info
                )
                break;
            case HttpErrorType.Unauthorized:
                displayNotification(
                    "Session invalid or expired",
                    "Your Session is invalid or expired. Please log in again.",
                    UINotificationType.Info
                )
                break;
            case HttpErrorType.BadRequest:
                displayNotification(
                    "Invalid input",
                    error.message
                )
                break;
            case HttpErrorType.Other:
                displayNotification(
                    "Unknown error",
                    error.message
                )
                break;
        }
    }

    const displayGenericErrorNotification = () => {
        displayNotification(
            "Unknown Error",
            "Oops! An unknown error has occured",
            UINotificationType.Error
        );
    }

    return {
        displayNotification,
        displayNotificationFromError
    }
}