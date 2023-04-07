import { UrlEncodedPublicKeyCredential } from "./webauthn"

export interface WebauthnCredential {
    name: string,
    currently_used: boolean
}

export interface Wallet {
    name: string,
    address: string,
    public: boolean
}

export interface UINotification {
    title: string,
    text: string
    type: UINotificationType
}

export enum UINotificationType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Success = 'success'
}

export interface User {
    name: string,
    email: string,
    wallets: PublicWallet[]
}

export interface PublicWallet {
    name: string,
    address: string
}

export interface TransactionInfo {
    chain: string,
    from: string,
    to: string,
    amount: string,
}

export interface TransactionFinalizePayload {
    assertion_response: UrlEncodedPublicKeyCredential,
    transaction_info: TransactionInfo
}

export interface CreateCredentialFinalizePayload {
    creation_response: UrlEncodedPublicKeyCredential,
    name: string
}

export interface BalanceResponse {
    balance: string,
}

export interface Transaction {
    hash: string,
    nonce: string,
    transaction_index: string,
    from_address: string,
    to_address: string,
    value: string,
    gas: string,
    gas_price: string,
    input: string,
    receipt_cumulative_gas_used: string,
    receipt_gas_used: string,
    receipt_contract_address: string,
    receipt_root: string,
    receipt_status: string,
    block_timestamp: string,
    block_number: string,
    block_hash: string,
    transfer_index: number[]
}

export interface TransactionResponse {
    cursor: string,
    transactions: Transaction[]
}

export interface Network {
    name: string,
    chain: string,
    block_explorer: string,
    currency: string,
    decimals: number
}

export interface Fees {
    estimated_fees: string,
    base_fee: string,
    tip: string
}
