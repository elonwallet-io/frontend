import { HttpError } from "./HttpError";
import { CreateCredentialFinalizePayload, EmergencyAccessContact, EmergencyAccessGrant, Fees, Network, OTP, SignTypedData, TransactionParams, Wallet, WebauthnCredential } from "./types";
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

    async registerFinalize(payload: CreateCredentialFinalizePayload): Promise<string> {
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

        const respJson = await resp.json();
        return respJson.backend_jwt;
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

    async sendTransactionInitialize(params: TransactionParams): Promise<UrlEncodedPublicKeyCredentialRequestOptions> {
        const resp = await fetch(`${this.baseURL}/transaction/send/initialize`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(params)
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.publicKey;
    }

    async sendTransactionFinalize(credential: UrlEncodedPublicKeyCredential): Promise<string> {
        const resp = await fetch(`${this.baseURL}/transaction/send/finalize`, {
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
        return respJson.hash;
    }

    async signTransactionInitialize(params: TransactionParams): Promise<UrlEncodedPublicKeyCredentialRequestOptions> {
        const resp = await fetch(`${this.baseURL}/transaction/sign/initialize`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(params)
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.publicKey;
    }

    async signTransactionFinalize(credential: UrlEncodedPublicKeyCredential): Promise<string> {
        const resp = await fetch(`${this.baseURL}/transaction/sign/finalize`, {
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
        return respJson.transaction;
    }

    async createEmergencyContact(contact_email: string, waiting_period_in_days: number): Promise<void> {
        const resp = await fetch(`${this.baseURL}/emergency-access/contacts`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ contact_email: contact_email, waiting_period_in_days: waiting_period_in_days })
        });

        if (resp.status !== 201) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async getEmergencyContacts(): Promise<EmergencyAccessContact[]> {
        const resp = await fetch(`${this.baseURL}/emergency-access/contacts`, {
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
        return respJson.emergency_contacts;
    }

    async removeEmergencyContact(contact_email: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/emergency-access/contacts/${encodeURIComponent(contact_email)}`, {
            method: "DELETE",
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
    }

    async denyEmergencyContactAccessRequest(contact_email: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/emergency-access/contacts/${encodeURIComponent(contact_email)}/deny-access`, {
            method: "POST",
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
    }

    async getEmergencyAccessGrants(): Promise<EmergencyAccessGrant[]> {
        const resp = await fetch(`${this.baseURL}/emergency-access/grants`, {
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
        return respJson.emergency_access_grants;
    }

    async respondEmergencyAccessGrantInvitation(grantor_email: string, accept: boolean): Promise<void> {
        const resp = await fetch(`${this.baseURL}/emergency-access/grants/respond-invitation`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ grantor_email: grantor_email, accept: accept })
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async requestEmergencyAccess(grantor_email: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/emergency-access/grants/request-access`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ grantor_email: grantor_email })
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async requestEmergencyAccessTakeover(grantor_email: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/emergency-access/grants/request-takeover`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ grantor_email: grantor_email })
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }
}