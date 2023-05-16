import { BackendApiClient } from "~~/lib/BackendApiClient"

export default function () {
    const config = useRuntimeConfig();
    const backendURL = config.public.backendUrl;
    const backendApiClient = new BackendApiClient(backendURL);

    return backendApiClient
}