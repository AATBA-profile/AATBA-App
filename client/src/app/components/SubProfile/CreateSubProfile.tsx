import { useSimpleUserStore } from "@root/app/context"
import { Web3Button } from "@thirdweb-dev/react"
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { simpleUserAccountAbi } from "../../../../constants"
import { initProtocolKit } from "../Dashboard/CreateUserAccount"
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'

type Props = {
    templateIndex: number
    simpleUser: string;
}

const CreateSubProfile = ({ templateIndex, simpleUser }: Props) => {
    const { simpleUserAccount } = useSimpleUserStore()
    const { push } = useRouter()
    let init = false;

    return (
        <Web3Button
            contractAbi={simpleUserAccountAbi}
            contractAddress={simpleUserAccount || simpleUser}
            action={(contract) => {
                safeCreateTransaction(init, simpleUser, contract.address, templateIndex)
                contract.call("createSubProfile", [templateIndex])
            }}
            onSuccess={(result: any) => {
                push("/")
            }}
        >
            createSubProfile (TBA)
        </Web3Button>
    )
}

async function safeCreateTransaction(init: any, user: any, destination: any, data: any) {
    const { safeSdk, safeService } = await initProtocolKit(init, user)
    const safeAddress = await safeSdk.getAddress()
    const amount = ethers.utils.parseUnits('0.0001', 'ether').toString()

    const safeTransactionData: SafeTransactionDataPartial = {
    to: destination,
    data: data,
    value: amount
    }
    // Create a Safe transaction with the provided parameters
    const safeTransaction = await safeSdk.createTransaction({ safeTransactionData })

    // Deterministic hash based on transaction parameters
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)

    // Sign transaction to verify that the transaction is coming from owner 1
    const senderSignature = await safeSdk.signTransactionHash(safeTxHash)

    await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: user,
    senderSignature: senderSignature.data,
    })

    // Executing the transaction as the threshold is set to 1
    const safeTransactionGet = await safeService.getTransaction(safeTxHash)
    const executeTxResponse = await safeSdk.executeTransaction(safeTransactionGet)
    const receipt = await executeTxResponse.transactionResponse?.wait()

    console.log('Transaction executed:')
    console.log(`https://goerli.etherscan.io/tx/${receipt.transactionHash}`)
}

export default CreateSubProfile
