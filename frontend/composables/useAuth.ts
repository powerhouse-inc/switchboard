import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import decode from 'jwt-decode'
import useWallet from './useWallet'

export declare interface User {
    address: string;
}

const user = ref(undefined as User | undefined)
const authStorage = useStorage('auth', {} as { token?: string })
const isLoading = ref(true)
const isAuthorized = computed(() => {
  return Boolean(authStorage.value.token && user.value?.address)
})

const useAuth = function () {
  if (authStorage.value?.token) {
    useGqlToken(authStorage.value?.token)
  }

  const checkAuthValidity = async () => {
    try {
      const { data, error } = await useAsyncGql('switchboard_me')
      if (error.value || !data.value?.switchboard_me) {
        user.value = undefined
        return
      }
      user.value = data.value?.switchboard_me
    } finally {
      isLoading.value = false
    }
  }

  const createChallenge = async function (address: string) {
    const { data, error } = await useAsyncGql('switchboard_createChallenge', { address })
    if (error.value || !data.value?.switchboard_createChallenge?.message) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    return data.value?.switchboard_createChallenge
  }

  const solveChallenge = async function (nonce: string, signature: string) {
    const { data, error } = await useAsyncGql('switchboard_solveChallenge', { nonce, signature })
    if (error.value || !data.value?.switchboard_solveChallenge?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    return data.value?.switchboard_solveChallenge.token
  }

  const signIn = async () => {
    const { connectWallet, signMessage } = useWallet()
    const address = await connectWallet()

    const { nonce, message } = await createChallenge(address)
    const signature = await signMessage(message)

    const token = await solveChallenge(nonce, signature)
    useGqlToken(token)
    authStorage.value.token = token

    await checkAuthValidity()
  }

  const createSession = async (name: string, expiryDurationSeconds: number | null, allowedOrigins: string) => {
    const { data, error } = await useAsyncGql('switchboard_createSession', { name, expiryDurationSeconds, allowedOrigins })
    if (error.value || !data.value?.createSession?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    return data.value?.switchboard_createSession?.token
  }

  const revokeSession = async (sessionId: string) => {
    const { data, error } = await useAsyncGql('switchboard_revokeSession', { sessionId })
    if (error.value || !data.value?.switchboard_revokeSession?.id) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    if (authStorage.value?.token) {
      const payload = decode(authStorage.value?.token) as { sessionId?: string } | undefined
      if (sessionId === payload?.sessionId) {
        authStorage.value.token = undefined
        await checkAuthValidity()
      }
    }
    return data.value?.switchboard_revokeSession?.referenceTokenId
  }

  const signOut = async () => {
    if (!authStorage.value?.token) {
      throw new Error('No user token provided')
    }
    const payload = decode(authStorage.value?.token) as { sessionId?: string } | undefined
    if (!payload || !payload.sessionId) {
      throw new Error('Token has invalid format')
    }
    await revokeSession(payload.sessionId)
  }

  onMounted(async () => {
    await nextTick()
    checkAuthValidity()
  })

  return { isLoading, isAuthorized, user, checkAuthValidity, signIn, signOut, createSession, revokeSession }
}

export default useAuth
