import { providers, utils } from 'ethers'

const walletAddress = ref(undefined as string | undefined)
const isConnected = computed(() => Boolean(walletAddress.value))

const useWallet = function () {
  const provider = new providers.Web3Provider((window as any).ethereum)

  const connectWallet = async function () {
    const addresses = await provider.send('eth_requestAccounts', [])
    walletAddress.value = utils.getAddress(addresses[0])
    return walletAddress.value
  }

  const signMessage = async function (message: string) {
    if (!walletAddress.value) {
      throw new Error('Wallet is not connected')
    }
    const signature = await provider.send('personal_sign', [
      message, walletAddress.value.toLowerCase()
    ])
    return signature
  }

  return { connectWallet, signMessage, isConnected, walletAddress }
}

export default useWallet
