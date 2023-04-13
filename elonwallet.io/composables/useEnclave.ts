import { EnclaveApiClient } from "~/lib/EnclaveApiClient";

export default function () {
    const enclaveURL = useEnclaveURL();

    return new EnclaveApiClient(enclaveURL.value!)
}