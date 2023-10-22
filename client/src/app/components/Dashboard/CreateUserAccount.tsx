import { Web3Button, useChainId, useAddress } from "@thirdweb-dev/react"
import { userAccountFactoryAbi } from "../../../../constants"
import ethers from 'ethers'
import { EthersAdapter, SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'

type Props = {}

const CreateUserAccount = (props: Props) => {
    // set address according to current chain id
    const chainId = useChainId()
    const userAccountFactoryAddress =
        chainId === 1337 ? process.env.NEXT_PUBLIC_HH_USER_ACCOUNT_FACTORY_ADDRESS! : process.env.NEXT_PUBLIC_USER_ACCOUNT_FACTORY_ADDRESS!
    
    return (
        <Web3Button
            contractAbi={userAccountFactoryAbi}
            contractAddress={userAccountFactoryAddress}
            action={(contract: any) => {
                contract.call("createUserAccount", [])
            }}
            onSuccess={(result: any) => {
            }}
            onError={(error) => alert("Something went wrong!")}
        >
            createUserAccount
        </Web3Button>
    )
}

export async function initProtocolKit(init: any, userAccount: any) {
    const txServiceUrl = 'https://safe-transaction-polygon.safe.global'
    const RPC_URL='https://mumbai.rpc.thirdweb.com'
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    let safeSdk;

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: provider
      })
    const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
    const userWallet = useAddress()

    if(!init) {
        const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter })
        const safeAccountConfig: SafeAccountConfig = {
            owners: [userAccount, userWallet],
            threshold: 1,
        }
        safeSdk = await safeFactory.deploySafe({ safeAccountConfig })
        init = true
    } else {
        // safeSdk = await safeSdk.connect({ ethAdapter, userWallet })
    }
    
    return {safeSdk, safeService}
}

export default CreateUserAccount
