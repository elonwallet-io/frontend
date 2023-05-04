import { isAddress, isHexString, toUtf8String } from "ethers"
import { SignTypedData } from "./types";

export function extractMessageAndSigner(params: string[]) {
    const message = params.find(p => !isAddress(p))!;
    const address = params.find(p => isAddress(p))!;

    return { message: convertHexToUtf8(message), address: address }
}

export function extractTypedDataAndSigner(params: string[]) {
    const address: string = params[0];
    const typedData: SignTypedData = JSON.parse(params[1]);

    return { typedData: typedData, address: address }
}

export function convertHexToUtf8(value: string): string {
    if (isHexString(value)) {
        return toUtf8String(value)
    }

    return value
}