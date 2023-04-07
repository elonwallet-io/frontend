import { BackendApiClient } from "~~/lib/BackendApiClient"
import { EnclaveApiClient } from "~~/lib/EnclaveApiClient";

export default function () {
    const backendApiClient = new BackendApiClient("http://localhost:8080");
    const enclaveApiClient = new EnclaveApiClient("http://localhost:8081");

    return {
        backendApiClient,
        enclaveApiClient
    }
}