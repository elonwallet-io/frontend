export interface UrlEncodedPublicKeyCredentialDescriptor {
    id: string;
    transports?: AuthenticatorTransport[];
    type: PublicKeyCredentialType;
}

export interface UrlEncodedPublicKeyCredentialUserEntity extends PublicKeyCredentialEntity {
    displayName: string;
    id: string;
}

export interface UrlEncodedPublicKeyCredentialCreationOptions {
    attestation?: AttestationConveyancePreference;
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    challenge: string;
    excludeCredentials?: UrlEncodedPublicKeyCredentialDescriptor[];
    extensions?: AuthenticationExtensionsClientInputs;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    rp: PublicKeyCredentialRpEntity;
    timeout?: number;
    user: UrlEncodedPublicKeyCredentialUserEntity;
}

export interface UrlEncodedPublicKeyCredentialRequestOptions {
    allowCredentials?: UrlEncodedPublicKeyCredentialDescriptor[];
    challenge: string;
    extensions?: AuthenticationExtensionsClientInputs;
    rpId?: string;
    timeout?: number;
    userVerification?: UserVerificationRequirement;
}

export interface UrlEncodedAuthenticatorAttestationResponse {
    attestationObject: string;
    clientDataJSON: string;
}


export interface UrlEncodedAuthenticatorAssertionResponse {
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
    clientDataJSON: string;
}

export interface UrlEncodedPublicKeyCredential extends Credential {
    rawId: string;
    response: UrlEncodedAuthenticatorAssertionResponse | UrlEncodedAuthenticatorAttestationResponse;
}


function base64url_encode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
}

function base64url_decode(value: string): ArrayBuffer {
    const m = value.length % 4;

    return Uint8Array.from(
        atob(
            value.replace(/-/g, '+')
                .replace(/_/g, '/')
                .concat(
                    "=".repeat(m === 0 ? 0 : 4 - m)
                )
        ), c => c.charCodeAt(0)).buffer
}

function decodeUrlEncodedPublicKeyCredentialCreationOptions(encodedOptions: UrlEncodedPublicKeyCredentialCreationOptions): PublicKeyCredentialCreationOptions {
    const excludedCredentials: PublicKeyCredentialDescriptor[] | undefined = encodedOptions.excludeCredentials?.map(cred => {
        return {
            id: base64url_decode(cred.id),
            transports: cred.transports,
            type: cred.type,
        }
    })

    const creationOptions: PublicKeyCredentialCreationOptions = {
        attestation: encodedOptions.attestation,
        authenticatorSelection: encodedOptions.authenticatorSelection,
        challenge: base64url_decode(encodedOptions.challenge),
        excludeCredentials: excludedCredentials,
        pubKeyCredParams: encodedOptions.pubKeyCredParams,
        rp: encodedOptions.rp,
        timeout: encodedOptions.timeout,
        user: {
            name: encodedOptions.user.name,
            displayName: encodedOptions.user.displayName,
            id: base64url_decode(encodedOptions.user.id)
        }
    }

    return creationOptions
}

function encodeRegistrationPublicKeyCredential(credential: PublicKeyCredential): UrlEncodedPublicKeyCredential {
    const attestation = credential.response as AuthenticatorAttestationResponse

    const encodedCredential: UrlEncodedPublicKeyCredential = {
        rawId: base64url_encode(credential.rawId),
        id: credential.id,
        type: credential.type,
        response: {
            attestationObject: base64url_encode(attestation.attestationObject),
            clientDataJSON: base64url_encode(attestation.clientDataJSON)
        }
    }

    return encodedCredential
}

function decodeUrlEncodedPublicKeyCredentialRequestOptions(encodedOptions: UrlEncodedPublicKeyCredentialRequestOptions): PublicKeyCredentialRequestOptions {
    const allowedCredentials: PublicKeyCredentialDescriptor[] | undefined = encodedOptions.allowCredentials?.map(cred => {
        return {
            id: base64url_decode(cred.id),
            transports: cred.transports,
            type: cred.type,
        }
    })

    const requestOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64url_decode(encodedOptions.challenge),
        extensions: encodedOptions.extensions,
        rpId: encodedOptions.rpId,
        timeout: encodedOptions.timeout,
        userVerification: encodedOptions.userVerification,
        allowCredentials: allowedCredentials
    }

    return requestOptions
}

function encodeLoginPublicKeyCredential(credential: PublicKeyCredential): UrlEncodedPublicKeyCredential {
    const assertion = credential.response as AuthenticatorAssertionResponse

    const encodedCredential: UrlEncodedPublicKeyCredential = {
        rawId: base64url_encode(credential.rawId),
        id: credential.id,
        type: credential.type,
        response: {
            authenticatorData: base64url_encode(assertion.authenticatorData),
            signature: base64url_encode(assertion.signature),
            userHandle: assertion.userHandle ? base64url_encode(assertion.userHandle) : null,
            clientDataJSON: base64url_encode(assertion.clientDataJSON)
        }
    }

    return encodedCredential
}

export async function registerCredential(encodedOptions: UrlEncodedPublicKeyCredentialCreationOptions): Promise<UrlEncodedPublicKeyCredential> {
    const creationOptions = decodeUrlEncodedPublicKeyCredentialCreationOptions(encodedOptions)

    const credential = await navigator.credentials.create({
        publicKey: creationOptions
    })

    return encodeRegistrationPublicKeyCredential(credential as PublicKeyCredential)
}

export async function solveLoginChallenge(encodedOptions: UrlEncodedPublicKeyCredentialRequestOptions): Promise<UrlEncodedPublicKeyCredential> {
    const requestOptions = decodeUrlEncodedPublicKeyCredentialRequestOptions(encodedOptions)

    const credential = await navigator.credentials.get({
        publicKey: requestOptions
    });

    return encodeLoginPublicKeyCredential(credential as PublicKeyCredential)
}


