import { BackendApiClient } from "~~/lib/BackendApiClient"

export default function () {
    const backendURL = "http://localhost:8080";
    const backendApiClient = new BackendApiClient(backendURL);

    return backendApiClient
}