import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react"
import { useEffect, useState } from "react"

const useUserAccountFactory = () => {
    const address = useAddress()
    const [user, setUser] = useState<string>(address!)

    const updateUser = (user: string) => setUser(user)

    useEffect(() => {
        if (address) updateUser(address!)
    }, [address])

    const getUserAccount = () => {
        if (!user || user === "undefined") return

        const { contract } = useContract(process.env.NEXT_PUBLIC_USER_ACCOUNT_FACTORY_ADDRESS)
        const { data, isLoading } = useContractRead(contract, "getUserAccount", [user])

        console.log("[getUserAccount]", data, isLoading)
        return { data, isLoading }
    }

    const getUserAccountsCount = () => {
        const { contract } = useContract(process.env.NEXT_PUBLIC_USER_ACCOUNT_FACTORY_ADDRESS)
        const { data, isLoading } = useContractRead(contract, "userAccountsCount", [])

        // console.log(data, isLoading)
        return { data, isLoading }
    }

    const getSubProfileFactory = () => {
        const { contract } = useContract(process.env.NEXT_PUBLIC_USER_ACCOUNT_FACTORY_ADDRESS)
        const { data, isLoading } = useContractRead(contract, "subProfileFactory", [])

        // console.log(data, isLoading)
        return { data, isLoading }
    }

    return [getUserAccount]
}

export default useUserAccountFactory
