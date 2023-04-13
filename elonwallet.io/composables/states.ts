import { Network, Wallet } from "~~/lib/types";

export const useCurrentWallet = () => useState<Wallet>('current_wallet');
export const useCurrentNetwork = () => useState<Network>('current_network');
export const useEmail = () => useState<string>('email');
export const useBackendJWT = () => useState<string>('backend_jwt');
export const useEnclaveURL = () => useState<string>('enclave_url');