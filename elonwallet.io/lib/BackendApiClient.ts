import { HttpError } from "./HttpError";
import { TransactionResponse as TransactionsResponse, User } from "./types";

export class BackendApiClient {
    private readonly baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    async getUser(email: string, jwt: string): Promise<User> {
        let resp = await fetch(`${this.baseURL}/users/${encodeURIComponent(email)}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        return resp.json();
    }

    async getBalance(address: string, chain: string, jwt: string): Promise<string> {
        let resp = await fetch(`${this.baseURL}/${address}/balance?chain=${chain}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const balanceJson = await resp.json();
        return balanceJson.balance;
    }

    async getTransactions(address: string, chain: string, jwt: string): Promise<TransactionsResponse> {
        let resp = await fetch(`${this.baseURL}/${address}/transactions?chain=${chain}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        return resp.json();
    }

    async createUser(name: string, email: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/users`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, email: email })
        });

        if (resp.status !== 201) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async createContact(contactEmail: string, jwt: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/contacts`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ email: contactEmail })
        });

        if (resp.status !== 201) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async removeContact(contactEmail: string, jwt: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/contacts/${contactEmail}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async getContacts(jwt: string): Promise<User[]> {
        const resp = await fetch(`${this.baseURL}/contacts`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.contacts;
    }

    async resendActivationLink(email: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/users/${encodeURIComponent(email)}/resend-activation-link`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (resp.status !== 201) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }


    async activateUser(email: string, activationString: string): Promise<void> {
        const resp = await fetch(`${this.baseURL}/users/${encodeURIComponent(email)}/activate`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activation_string: activationString })
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }
    }

    async getEnclaveURL(email: string): Promise<string> {
        let resp = await fetch(`${this.baseURL}/users/${encodeURIComponent(email)}/enclave-url`, {
            method: "GET",
            headers: {
                'Accept': 'application/json'
            },
        });

        if (resp.status !== 200) {
            const error = await HttpError.fromResponse(resp);
            throw error;
        }

        const respJson = await resp.json();
        return respJson.enclave_url;
    }
}