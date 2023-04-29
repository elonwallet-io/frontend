import { HttpError } from "./HttpError";
import { CreateCredentialFinalizePayload, Fees, Network, OTP, SignTypedData, TransactionFinalizePayload, Wallet, WebauthnCredential } from "./types";
import { UrlEncodedPublicKeyCredential, UrlEncodedPublicKeyCredentialCreationOptions, UrlEncodedPublicKeyCredentialRequestOptions } from "./webauthn";

export class EnclaveApiClient {
    private readonly baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    async registerInitialize(email: string): Promise<UrlEncodedPublicKeyCredentialCreationOptions> {
        const resp = await fetch(`${this.baseURL}/register/initialize?email=${encodeURIComponent(email)}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.publicKey;
    }

    async registerFinalize(payload: CreateCredentialFinalizePayload): Promise<void> {
        const resp = await fetch(`${this.baseURL}/register/finalize`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async loginInitialize(): Promise<UrlEncodedPublicKeyCredentialRequestOptions> {
        const resp = await fetch(`${this.baseURL}/login/initialize`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.publicKey;
    }

    async loginFinalize(credential: UrlEncodedPublicKeyCredential): Promise<string> {
        const resp = await fetch(`${this.baseURL}/login/finalize`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(credential)
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.backend_jwt;
    }

    async createWallet(name: string, visible: boolean): Promise<void> {
        const resp = await fetch(`${this.baseURL}/wallets`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name: name, public: visible })
        });

        if (resp.status !== 201) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async getWallets(): Promise<Wallet[]> {
        const resp = await fetch(`${this.baseURL}/wallets`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.wallets;
    }

    async createCredentialInitialize(): Promise<UrlEncodedPublicKeyCredentialCreationOptions> {
        const resp = await fetch(`${this.baseURL}/credentials/initialize`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.publicKey;
    }

    async createCredentialFinalize(payload: CreateCredentialFinalizePayload): Promise<void> {
        const resp = await fetch(`${this.baseURL}/credentials/finalize`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async removeCredential(name: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/credentials/${name}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async getCredentials(): Promise<WebauthnCredential[]> {
        const resp = await fetch(`${this.baseURL}/credentials`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.credentials;
    }

    async getNetworks(): Promise<Network[]> {
        const resp = await fetch(`${this.baseURL}/networks`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.networks;
    }

    async getFees(chain: string): Promise<Fees> {
        const resp = await fetch(`${this.baseURL}/fees?chain=${chain}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson;
    }

    async logout(): Promise<void> {
        const resp = await fetch(`${this.baseURL}/logout`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async getOTP(): Promise<OTP> {
        const resp = await fetch(`${this.baseURL}/otp`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson;
    }

    async loginWithOTP(otp: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/otp/login`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ otp: otp })
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async signPersonal(message: string, from: string): Promise<string> {
        const resp = await fetch(`${this.baseURL}/message/sign`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ message: message, from: from })
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.signature;
    }

    async signTypedData(typedData: SignTypedData, from: string): Promise<string> {
        const resp = await fetch(`${this.baseURL}/typed-data/sign`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ typed_data: typedData, from: from })
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.signature;
    }

    async sendTransactionInitialize(): Promise<UrlEncodedPublicKeyCredentialRequestOptions> {
        const resp = await fetch(`${this.baseURL}/transaction/send/initialize`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.publicKey;
    }

    async sendTransactionFinalize(payload: TransactionFinalizePayload): Promise<string> {
        const resp = await fetch(`${this.baseURL}/transaction/send/finalize`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }


        const respJson = await resp.json();
        return respJson.hash;
    }

    async signTransactionInitialize(): Promise<UrlEncodedPublicKeyCredentialRequestOptions> {
        const resp = await fetch(`${this.baseURL}/transaction/sign/initialize`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.publicKey;
    }

    async signTransactionFinalize(payload: TransactionFinalizePayload): Promise<string> {
        const resp = await fetch(`${this.baseURL}/transaction/sign/finalize`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.transaction;
    }
}