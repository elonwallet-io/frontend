import { Network, Wallet } from "~~/lib/types";

export const useCurrentWallet = () => useState<Wallet | undefined>('current_wallet');
export const useCurrentNetwork = () => useState<Network | undefined>('current_network');