import { Core } from '@walletconnect/core'
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import Client, { Web3Wallet } from '@walletconnect/web3wallet'
import { SignClientTypes, SessionTypes } from '@walletconnect/types'
import { WcViews, WcViewEvent } from '~/lib/types';
import { JsonRpcResponse } from "@walletconnect/jsonrpc-utils";

export default function () {
    const web3wallet = ref<Client>();
    const config = useRuntimeConfig();
    const session = ref<SessionTypes.Struct>();
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
                icons: []
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
    })

    const connect = async (uri: string) => {
        await web3wallet.value!.pair({ uri })
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

    const CAIP2FormattedNetworks = computed(() => {
        return networks.value?.map(n => `eip155:${parseInt(n.chain, 16)}`) ?? []
    })

    const CAIP10FormmatedWallets = computed(() => {
        const accounts = new Array<string>();

        for (const wallet of wallets.value ?? []) {
            for (const network of CAIP2FormattedNetworks.value) {
                accounts.push(`${network}:${wallet.address}`);
            }
        }
        return accounts;
    })

    const onRespondSessionRequest = async (response: JsonRpcResponse, requestEvent: SignClientTypes.EventArguments['session_request']) => {
        console.log(response, requestEvent)
        viewEvents.value = { view: WcViews.Connect }
        web3wallet.value!.respondSessionRequest({ topic: requestEvent.topic, response: response })
    }


    return {
        connect,
        viewEvents,
        onRespondSessionRequest
    }
}