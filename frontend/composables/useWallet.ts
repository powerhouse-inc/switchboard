import { providers, utils } from 'ethers'

declare global {
  interface Window {
    ethereum?: providers.ExternalProvider;
  }
}

const walletAddress = ref(undefined as string | undefined)
const isConnected = computed(() => Boolean(walletAddress.value))

const useWallet = function () {
  const getProvider = () => {
    if (!window.ethereum) {
      throw new Error('Please install web-based wallet such as Metamask')
    }
    return new providers.Web3Provider(window.ethereum)
  }

  const connectWallet = async function () {
    const addresses = await getProvider().send('eth_requestAccounts', [])
    walletAddress.value = utils.getAddress(addresses[0])
    return walletAddress.value
  }

  const signMessage = async function (message: string) {
    if (!walletAddress.value) {
      throw new Error('Wallet is not connected')
    }
    const signature = await getProvider().send('personal_sign', [
      message, walletAddress.value.toLowerCase()
    ])
    return signature
  }

  return { connectWallet, signMessage, isConnected, walletAddress }
}

export default useWallet
