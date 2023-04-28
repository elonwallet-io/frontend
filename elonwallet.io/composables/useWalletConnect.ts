import { Core } from '@walletconnect/core'
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import Client, { Web3Wallet } from '@walletconnect/web3wallet'
import { SignClientTypes, SessionTypes } from '@walletconnect/types'
import { HttpError, HttpErrorType } from '~/lib/HttpError';
import { solveLoginChallenge } from '~/lib/webauthn';
import { isHexString, toUtf8String } from 'ethers';
import { WalletConnectTransactionParams } from '~/lib/types';

export default function () {
    const web3wallet = ref<Client>();
    const config = useRuntimeConfig();
    const session = ref<SessionTypes.Struct>();
    const enclaveApiClient = useEnclave();
    const { displayNotificationFromError } = useNotification();
    const currentWallet = useCurrentWallet();

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
            const signature = await enclaveApiClient.createPersonalSignature(message, from);
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
        console.log(response)
        await web3wallet.value!.respondSessionRequest({ topic, response })
    }

    const onSendTransaction = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params, id } = requestEvent
        const enclaveApiClient = useEnclave();
        const signParams: WalletConnectTransactionParams = params.request.params[0];

        try {
            const options = await enclaveApiClient.sendTransactionInitialize();
            const credential = await solveLoginChallenge(options);

            if (signParams.data !== "0x") {
                await rejectSessionRequest(id, topic, "ERC20 is currently not supported");
            }

            const tx = await enclaveApiClient.sendTransactionFinalize({
                assertion_response: credential,
                transaction_params: {
                    chain: "0x5",
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

        if (signParams.data !== "0x") {
            await rejectSessionRequest(id, topic, "ERC20 is currently not supported");
        }

        //TODO fix 'invalid remainder' bug

        try {
            const options = await enclaveApiClient.signTransactionInitialize();
            const credential = await solveLoginChallenge(options);
            const txParams = {
                assertion_response: credential,
                transaction_params: {
                    chain: "0x5",
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

    const onSessionRequest = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        console.log('session_request', requestEvent)
        const { topic, params, id } = requestEvent
        const { request } = params
        const requestSession = web3wallet.value!.getActiveSessions()[topic]

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
            default:
                await rejectSessionRequest(id, topic);
        }
    }

    const onSessionProposal = async (requestEvent: SignClientTypes.EventArguments['session_proposal']) => {
        const { id, params } = requestEvent

        console.log(params)

        const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
                eip155: {
                    chains: ["eip155:1", "eip155:5"],
                    methods: ["personal_sign", "eth_sendTransaction", "eth_signTransaction", "eth_signTypedData", "eth_sign"],
                    events: ["accountsChanged", "chainChanged"],
                    accounts: [`eip155:1:${currentWallet.value.address}`, `eip155:5:${currentWallet.value.address}`]
                },
            },
        });


        session.value = await web3wallet.value!.approveSession({
            id: id,
            namespaces: approvedNamespaces
        })
    }

    function convertHexToUtf8(value: string) {
        console.log(value)
        if (isHexString(value)) {
            return toUtf8String(value)
        }

        return value
    }

    return {
        connect
    }
}