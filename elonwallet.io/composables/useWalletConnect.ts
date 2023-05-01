import { Core } from '@walletconnect/core'
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import Client, { Web3Wallet } from '@walletconnect/web3wallet'
import { SignClientTypes, SessionTypes } from '@walletconnect/types'
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { solveLoginChallenge } from '~/lib/webauthn';
import { SignTypedData, WalletConnectTransactionParams } from '~/lib/types';

export default function () {
    const web3wallet = ref<Client>();
    const config = useRuntimeConfig();
    const session = ref<SessionTypes.Struct>();
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();
    const { networks } = useNetworks();
    const { wallets } = useWallets();

    onMounted(async () => {
        const core = new Core({
            projectId: config.public.projectId,
            logger: 'debug'
        })

        web3wallet.value = await Web3Wallet.init({
            core,
            metadata: {
                name: 'ElonWallet',
                description: 'ElonWallet Development Version',
                url: 'www.walletconnect.com',
                icons: []
            }
        })

        web3wallet.value!.on('session_proposal', onSessionProposal)
        web3wallet.value!.on('session_request', onSessionRequest)
        web3wallet.value!.on('session_delete', data => console.log('delete', data))
    })

    onUnmounted(async () => {
        web3wallet.value!.off('session_proposal', onSessionProposal)
        web3wallet.value!.off('session_request', onSessionRequest)
        web3wallet.value!.off('session_delete', data => console.log('delete', data))
    })

    const connect = async (uri: string) => {
        await web3wallet.value!.pair({ uri })
    }

    const rejectSessionRequest = async (id: number, topic: string, message: string) => {
        const response = {
            id,
            jsonrpc: '2.0',
            error: {
                code: 5000,
                message: message
            }
        }


        await web3wallet.value!.respondSessionRequest({ topic, response })
    }

    const signMessage = async (message: string, from: string): Promise<string> => {
        try {
            const signature = await enclaveApiClient.signPersonal(message, from);
            return signature;
        } catch (error) {
            displayNotificationFromError(error);
            if (error instanceof HttpError && error.type === HttpErrorType.Unauthorized) {
                navigateTo("/login")
            }
            return "";
        }
    }

    const onSignMessage = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params, id } = requestEvent
        const { request } = params
        let signature = "";

        if (request.method === "eth_sign")
            signature = await signMessage(request.params[1], request.params[0]);
        else
            signature = await signMessage(request.params[0], request.params[1]);


        const response = { id, result: signature, jsonrpc: '2.0' }
        await web3wallet.value!.respondSessionRequest({ topic, response })
    }

    const onSendTransaction = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params, id } = requestEvent
        const enclaveApiClient = useEnclave();
        const signParams: WalletConnectTransactionParams = params.request.params[0];

        try {
            const options = await enclaveApiClient.sendTransactionInitialize();
            const credential = await solveLoginChallenge(options);

            const tx = await enclaveApiClient.sendTransactionFinalize({
                assertion_response: credential,
                transaction_params: {
                    chain: convertToHexChainId(params.chainId),
                    from: signParams.from,
                    to: signParams.to,
                    data: signParams.data,
                    gas: BigInt(signParams.gasLimit ?? "").toString(),
                    gas_price: BigInt(signParams.gasPrice ?? "").toString(),
                    nonce: BigInt(signParams.nonce ?? "").toString(),
                    value: BigInt(signParams.value ?? "").toString()
                }
            });

            const response = { id, result: tx, jsonrpc: '2.0' }
            console.log(response)
            await web3wallet.value!.respondSessionRequest({ topic, response })
        } catch (error) {
            displayNotificationFromError(error);
            await rejectSessionRequest(id, topic, "An unknown error occured");
        }
    }

    const onSignTransaction = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params, id } = requestEvent
        const enclaveApiClient = useEnclave();
        const signParams: WalletConnectTransactionParams = params.request.params[0];

        //TODO investigate 'invalid remainder' bug

        try {
            const options = await enclaveApiClient.signTransactionInitialize();
            const credential = await solveLoginChallenge(options);
            const txParams = {
                assertion_response: credential,
                transaction_params: {
                    chain: convertToHexChainId(params.chainId),
                    from: signParams.from,
                    to: signParams.to,
                    data: signParams.data,
                    gas: BigInt(signParams.gasLimit ?? "").toString(),
                    gas_price: BigInt(signParams.gasPrice ?? "").toString(),
                    nonce: BigInt(signParams.nonce ?? "").toString(),
                    value: BigInt(signParams.value ?? "").toString()
                }
            };
            console.log(txParams);
            const tx = await enclaveApiClient.signTransactionFinalize(txParams);

            const response = { id, result: tx, jsonrpc: '2.0' }
            console.log(response)
            await web3wallet.value!.respondSessionRequest({ topic, response })
        } catch (error) {
            displayNotificationFromError(error);
            await rejectSessionRequest(id, topic, "An unknown error occured");
        }
    }

    const onSignTypedData = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params, id } = requestEvent
        const enclaveApiClient = useEnclave();
        const from: string = params.request.params[0];
        const typedData: SignTypedData = JSON.parse(params.request.params[1]);

        try {
            const signature = await enclaveApiClient.signTypedData(typedData, from);
            const response = { id, result: signature, jsonrpc: '2.0' }
            await web3wallet.value!.respondSessionRequest({ topic, response })
        } catch (error) {
            displayNotificationFromError(error);
            await rejectSessionRequest(id, topic, "An unknown error occured");
        }
    }

    const onSessionRequest = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        console.log('session_request', requestEvent)
        const { topic, params, id } = requestEvent
        const { request } = params
        //const requestSession = web3wallet.value!.getActiveSessions()[topic]

        console.log(params)

        switch (request.method) {
            case 'eth_sign':
            case 'personal_sign':
                await onSignMessage(requestEvent);
                break;
            case 'eth_sendTransaction':
                await onSendTransaction(requestEvent);
                break;
            case 'eth_signTransaction':
                await onSignTransaction(requestEvent);
                break;
            case 'eth_signTypedData':
                await onSignTypedData(requestEvent);
                break;
            default:
                await rejectSessionRequest(id, topic, "Method not supported");
        }
    }

    const onSessionProposal = async (requestEvent: SignClientTypes.EventArguments['session_proposal']) => {
        const { id, params } = requestEvent

        console.log(params)

        const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
                eip155: {
                    chains: CAIP2FormattedNetworks.value,
                    methods: ["personal_sign", "eth_sendTransaction", "eth_signTransaction", "eth_signTypedData", "eth_sign"],
                    events: ["accountsChanged", "chainChanged"],
                    accounts: CAIP10FormmatedWallets.value
                },
            },
        });


        session.value = await web3wallet.value!.approveSession({
            id: id,
            namespaces: approvedNamespaces
        })
    }

    function convertToHexChainId(value: string): string {
        const chain = parseInt(value.replace("eip155:", ""), 10);
        return `0x${chain.toString(16)}`
    }

    const CAIP2FormattedNetworks = computed(() => networks.value!.map(n => {
        return `eip155:${parseInt(n.chain, 16)}`
    }))

    const CAIP10FormmatedWallets = computed(() => {
        const accounts = new Array<string>();
        for (const wallet of wallets.value!) {
            for (const network of CAIP2FormattedNetworks.value) {
                accounts.push(`${network}:${wallet.address}`);
            }
        }
        return accounts;
    })


    return {
        connect
    }
}