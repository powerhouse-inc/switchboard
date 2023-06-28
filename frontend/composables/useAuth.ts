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
      const { data, error } = await useAsyncGql('me')
      if (error.value || !data.value?.me) {
        user.value = undefined
        return
      }
      user.value = data.value?.me
    } finally {
      isLoading.value = false
    }
  }

  const createChallenge = async function (address: string) {
    const { data, error } = await useAsyncGql('createChallenge', { address })
    if (error.value || !data.value?.createChallenge?.message) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    return data.value?.createChallenge
  }

  const solveChallenge = async function (nonce: string, signature: string) {
    const { data, error } = await useAsyncGql('solveChallenge', { nonce, signature })
    if (error.value || !data.value?.solveChallenge?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    return data.value?.solveChallenge.token
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
    const { data, error } = await useAsyncGql('createSession', { name, expiryDurationSeconds, allowedOrigins })
    if (error.value || !data.value?.createSession?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    return data.value?.createSession?.token
  }

  const revokeSession = async (sessionId: string) => {
    const { data, error } = await useAsyncGql('revokeSession', { sessionId })
    if (error.value || !data.value?.revokeSession?.id) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    if (authStorage.value?.token) {
      const payload = decode(authStorage.value?.token) as { sessionId?: string } | undefined
      if (sessionId === payload?.sessionId) {
        authStorage.value.token = undefined
        await checkAuthValidity()
      }
    }
    return data.value?.revokeSession?.referenceTokenId
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
