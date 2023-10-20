import { useSimpleUserStore } from "@root/app/context"
import { Web3Button } from "@thirdweb-dev/react"
import { subProfileTBAAbi, subProfileTBAAddress, testNFTAbi1 } from "../../../../constants"

type Props = {
    subProfileAddress: string
}

const GetBatchButton = ({ subProfileAddress }: Props) => {
    const { simpleUserAccount, setSimpleUserAccount } = useSimpleUserStore()   

    return (
        <Web3Button
            contractAbi={subProfileTBAAbi}
            contractAddress={subProfileAddress}
            action={(contract: any) => {
                contract.call("getSubProfileBadges", [])
            }}
            onSuccess={(result: any) => {}}
            onError={(error) => alert("Something went wrong!")}
        >
            subProfileBadges()
        </Web3Button>
    )
}

export default GetBatchButton
