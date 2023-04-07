export enum HttpErrorType {
    InternalServerError,
    Conflict,
    NotFound,
    Forbidden,
    Unauthorized,
    BadRequest,
    Other
}

export class HttpError extends Error {
    public readonly type: HttpErrorType;

    constructor(message: string, type: HttpErrorType) {
        super(message);
        this.name = this.constructor.name;
        this.type = type;
    }

    static async fromResponse(resp: Response): Promise<HttpError> {
        let errorJson: any;
        switch (resp.status) {
            case 500:
                return new HttpError("", HttpErrorType.InternalServerError)
            case 409:
                errorJson = await resp.json();
                return new HttpError(errorJson.message, HttpErrorType.Conflict);
            case 404:
                errorJson = await resp.json();
                return new HttpError(errorJson.message, HttpErrorType.NotFound);
            case 403:
                return new HttpError("", HttpErrorType.Forbidden);
            case 401:
                return new HttpError("", HttpErrorType.Unauthorized);
            case 400:
                errorJson = await resp.json();
                return new HttpError(errorJson.message, HttpErrorType.BadRequest);
            default:
                throw new HttpError(resp.statusText, HttpErrorType.Other)
        }
    }
}