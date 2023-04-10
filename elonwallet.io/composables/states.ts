import { Network, Wallet } from "~~/lib/types";

export const useCurrentWallet = () => useState<Wallet | undefined>('current_wallet');
export const useCurrentNetwork = () => useState<Network | undefined>('current_network');
export const useEmail = () => useState<string>('email');
export const useEnclaveURL = () => useState<string>('enclave_url', () => "http://localhost:8081");
export const useBackendURL = () => useState<string>('backend_url', () => "http://localhost:8080");