import { BackendApiClient } from "~~/lib/BackendApiClient"
import { EnclaveApiClient } from "~~/lib/EnclaveApiClient";

export default function () {
    const backendURL = useBackendURL();
    const enclaveURL = useEnclaveURL();
    const backendApiClient = new BackendApiClient(backendURL.value);
    const enclaveApiClient = new EnclaveApiClient(enclaveURL.value);

    return {
        backendApiClient,
        enclaveApiClient
    }
}