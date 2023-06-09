import { Core } from '@walletconnect/core'
import { getSdkError } from "@walletconnect/utils";
import Client, { Web3Wallet } from '@walletconnect/web3wallet'
import { SignClientTypes } from '@walletconnect/types'
import { WcViews, WcViewEvent } from '~/lib/types';
import { JsonRpcResponse } from "@walletconnect/jsonrpc-utils";

export default function () {
    const web3wallet = ref<Client>();
    const config = useRuntimeConfig();
    const viewEvents = ref<WcViewEvent>({
        view: WcViews.Connect,
    })

    onMounted(async () => {
        const core = new Core({
            projectId: config.public.projectId
        })

        web3wallet.value = await Web3Wallet.init({
            core,
            metadata: {
                name: 'ElonWallet',
                description: 'ElonWallet',
                url: 'https://elonwallet.io',
                icons: ['https://avatars.githubusercontent.com/u/37784886']
            }
        })

        web3wallet.value.on('session_proposal', onSessionProposal)
        web3wallet.value.on('session_request', onSessionRequest)
    })

    onUnmounted(async () => {
        web3wallet.value!.off('session_proposal', onSessionProposal)
        web3wallet.value!.off('session_request', onSessionRequest)

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
        viewEvents.value = {
            view: WcViews.SessionProposal,
            proposal: requestEvent
        }
    }

    const onRespondSessionRequest = async (response: JsonRpcResponse, requestEvent: SignClientTypes.EventArguments['session_request']) => {
        viewEvents.value = { view: WcViews.Connect }
        web3wallet.value!.respondSessionRequest({ topic: requestEvent.topic, response: response })
    }

    const onRespondSessionProposal = async (responseType: "approve" | "reject", params: any) => {
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