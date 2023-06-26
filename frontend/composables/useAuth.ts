import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import decode from 'jwt-decode'

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
    if (user.value) {
      return
    }
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

  const signIn = async () => {
    const address = '0x0'
    const { data, error } = await useAsyncGql('createChallenge', { address })
    if (error.value || !data.value?.createChallenge?.message) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    // useGqlToken(data.value?.signIn?.token)
    // authStorage.value.token = data.value?.signIn?.token
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
