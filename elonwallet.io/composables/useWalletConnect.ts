import { Core } from '@walletconnect/core'
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import Client, { Web3Wallet } from '@walletconnect/web3wallet'
import { SignClientTypes, SessionTypes } from '@walletconnect/types'
import { HttpError, HttpErrorType } from '~/lib/HttpError';

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

    const rejectSessionRequest = async (id: number, topic: string) => {
        const response = {
            id,
            jsonrpc: '2.0',
            error: {
                code: 5000,
                message: 'User rejected.'
            }
        }


        await web3wallet.value!.respondSessionRequest({ topic, response })
    }

    const signMessage = async (message: string, chain: string, from: string): Promise<string> => {
        try {
            const signature = await enclaveApiClient.createPersonalSignature(message, "0x1", from);
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
            signature = await signMessage(request.params[1], "0x1", request.params[0]);
        else
            signature = await signMessage(request.params[0], "0x1", request.params[1]);


        const response = { id, result: signature, jsonrpc: '2.0' }
        console.log(response)
        await web3wallet.value!.respondSessionRequest({ topic, response })
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
                onSignMessage(requestEvent);
                break;
            case 'eth_sendTransaction':
                await rejectSessionRequest(id, topic);
                break;
            case 'eth_signTransaction':
                await rejectSessionRequest(id, topic);
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

    return {
        connect
    }
}