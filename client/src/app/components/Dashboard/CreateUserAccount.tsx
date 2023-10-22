import { Web3Button, useChainId, useAddress } from "@thirdweb-dev/react"
import { userAccountFactoryAbi } from "../../../../constants"
import ethers from 'ethers'
import { EthersAdapter, SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'

const txServiceUrl = 'https://safe-transaction-goerli.safe.global'
const RPC_URL='https://eth-goerli.public.blastapi.io'
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
type Props = {}

const CreateUserAccount = async (props: Props) => {
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
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signerOrProvider: provider
                  })
                const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
                const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter })
                const userWallet = useAddress()
                const safeAccountConfig: SafeAccountConfig = {
                    owners: [result.Account, userWallet],
                    threshold: 1,
                  }
                const safeSdk = await safeFactory.deploySafe({ safeAccountConfig })
                const safeAddress = safeSdk.getAddress()

            }}
            onError={(error) => alert("Something went wrong!")}
        >
            createUserAccount
        </Web3Button>
    )
}

export default CreateUserAccount
