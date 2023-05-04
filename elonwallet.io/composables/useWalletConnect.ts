import { Core } from '@walletconnect/core'
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import Client, { Web3Wallet } from '@walletconnect/web3wallet'
import { SignClientTypes, SessionTypes } from '@walletconnect/types'
import { WcViews, WcViewEvent } from '~/lib/types';
import { JsonRpcResponse } from "@walletconnect/jsonrpc-utils";

export default function () {
    const web3wallet = ref<Client>();
    const config = useRuntimeConfig();
    const { networks } = useNetworks();
    const { wallets } = useWallets();
    const viewEvents = ref<WcViewEvent>({
        view: WcViews.Connect,
    })

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
                icons: ['https://avatars.githubusercontent.com/u/37784886']
            }
        })

        web3wallet.value.on('session_proposal', onSessionProposal)
        web3wallet.value.on('session_request', onSessionRequest)
        web3wallet.value.on('session_delete', data => console.log('delete', data))
    })

    onUnmounted(async () => {
        web3wallet.value!.off('session_proposal', onSessionProposal)
        web3wallet.value!.off('session_request', onSessionRequest)
        web3wallet.value!.off('session_delete', data => console.log('delete', data))

        const sessions = web3wallet.value!.getActiveSessions();
        for (const key in sessions) {
            const session = sessions[key];
            const reason = getSdkError('USER_DISCONNECTED')
            await web3wallet.value!.disconnectSession({
                topic: session.topic,
                reason: reason
            })
        }
    })

    const connect = async (uri: string) => {
        await web3wallet.value!.pair({ uri })
    }

    const onSessionRequest = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        console.log('session_request', requestEvent)
        const { topic, params, id } = requestEvent
        const { request } = params
        const requestSession = web3wallet.value!.getActiveSessions()[topic]

        switch (request.method) {
            case 'eth_sign':
            case 'personal_sign':
                viewEvents.value = {
                    view: WcViews.SignMessage,
                    data: { requestEvent, requestSession }
                }
                break;
            case 'eth_sendTransaction':
                viewEvents.value = {
                    view: WcViews.SendTransaction,
                    data: { requestEvent, requestSession }
                }
                break;
            case 'eth_signTransaction':
                viewEvents.value = {
                    view: WcViews.SignTransaction,
                    data: { requestEvent, requestSession }
                }
                break;
            case 'eth_signTypedData':
                viewEvents.value = {
                    view: WcViews.SignTypedData,
                    data: { requestEvent, requestSession }
                }
                break;
            default:
                const response = {
                    id,
                    jsonrpc: '2.0',
                    error: getSdkError('UNSUPPORTED_METHODS')
                }

                await web3wallet.value!.respondSessionRequest({ topic, response })
        }
    }

    const onSessionProposal = async (requestEvent: SignClientTypes.EventArguments['session_proposal']) => {
        console.log('session_proposal', requestEvent)

        viewEvents.value = {
            view: WcViews.SessionProposal,
            proposal: requestEvent
        }
    }

    const onRespondSessionRequest = async (response: JsonRpcResponse, requestEvent: SignClientTypes.EventArguments['session_request']) => {
        console.log(response, requestEvent)
        viewEvents.value = { view: WcViews.Connect }
        web3wallet.value!.respondSessionRequest({ topic: requestEvent.topic, response: response })
    }

    const onRespondSessionProposal = async (responseType: "approve" | "reject", params: any) => {
        console.log(responseType, params)
        viewEvents.value = { view: WcViews.Connect }

        if (responseType === "approve") {
            await web3wallet.value!.approveSession(params)
        } else {
            await web3wallet.value!.rejectSession(params)
        }
    }


    return {
        connect,
        viewEvents,
        onRespondSessionRequest,
        onRespondSessionProposal
    }
}