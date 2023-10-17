import { useAddress, useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { useEffect, useState } from "react"

interface UserAccountProps {
    account?: string
}

const useSubProfileFactory = () => {
    const address = useAddress()
    const [userAddress, setUserAddress] = useState<string>(address!)
    const [subProfileTemplateAddress, setSubProfileTemplateAddress] = useState<string>()

    const updateUser = (user: string) => setUserAddress(user)

    useEffect(() => {
        if (address) updateUser(address!)
        return
    }, [address])

    const getSubProfileTemplateRegistryAddress = () => {
        const { contract } = useContract(process.env.NEXT_PUBLIC_SUB_PROFILE_FACTORY_ADDRESS) // SubProfileFactory address
        const { data, isLoading } = useContractRead(contract, "subProfileTemplateRegistryAddress", [])

        return { data, isLoading }
    }

    const getTBAAccount = () => {
        const index = 0
        const tokenId = "tokenId"

        const { contract } = useContract(process.env.NEXT_PUBLIC_SUB_PROFILE_FACTORY_ADDRESS)
        const { data, isLoading } = useContractRead(contract, "tbaAccount", [index, tokenId])

        return { data, isLoading }
    }

    return [getSubProfileTemplateRegistryAddress]
}

export default useSubProfileFactory
