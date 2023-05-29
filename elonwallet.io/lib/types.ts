import { TypedDataDomain, TypedDataField } from "ethers"
import { UrlEncodedPublicKeyCredential } from "./webauthn"
import { SignClientTypes, SessionTypes } from "@walletconnect/types"

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
    chain_id: number,
    chain_id_hex: string,
    block_explorer: string,
    currency: string,
    decimals: number,
    testnet: boolean
}

export interface Fees {
    estimated_fees: string,
    base_fee: string,
    tip: string
}

export interface OTP {
    secret: string,
    valid_until: number,
    times_tried: number,
    active: boolean
}

export interface TransactionParams {
    type: string,
    nonce?: string,
    to: string,
    from: string,
    gas?: string,
    value?: string,
    input?: string,
    gasPrice?: string,
    maxFeePerGas?: string,
    maxPriorityFeePerGas?: string,
    accessList?: any,
    chainId?: string,
}

export interface TransactionFinalizePayload {
    assertion_response: UrlEncodedPublicKeyCredential,
    transaction_params: TransactionParams
}

export interface SignTypedData {
    types: Record<string, Array<TypedDataField>>,
    primaryType: string,
    domain: TypedDataDomain,
    message: Record<string, any>
}

export interface WcViewEvent {
    view: WcViews,
    data?: WcData
    proposal?: SignClientTypes.EventArguments['session_proposal']
}

export interface WcData {
    requestEvent: SignClientTypes.EventArguments['session_request'],
    requestSession: SessionTypes.Struct
}

export enum WcViews {
    Connect,
    SignMessage,
    SignTypedData,
    SendTransaction,
    SignTransaction,
    SessionProposal
}

export interface EmergencyAccessContact {
    email: string,
    enclave_url: string,
    has_accepted: boolean,
    has_requested_takeover: boolean,
    waiting_period_in_days: number,
    takeover_allowed_after: number,
    notification_series_id: string,
}

export interface EmergencyAccessGrant {
    email: string,
    enclave_url: string,
    has_accepted: boolean,
    has_requested_takeover: boolean,
    takeover_allowed_after: number,
    notification_series_id: string,
}
