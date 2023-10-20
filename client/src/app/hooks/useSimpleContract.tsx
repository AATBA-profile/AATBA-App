import { useContract, useContractRead } from "@thirdweb-dev/react"
import { simpleUserAccountAbi } from "../../../constants"

const useSubProfileFactory = () => {
    const getSubProfile = (index: number, address: string) => {
        const { contract } = useContract(address, simpleUserAccountAbi)
        const { data, isLoading } = useContractRead(contract, "getSubProfile", [index])

        return { data, isLoading }
    }

    return [getSubProfile]
}

export default useSubProfileFactory
