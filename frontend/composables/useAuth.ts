import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import decode from 'jwt-decode'

export declare interface User {
    id: string;
    username: string;
}

const user = ref(undefined as User | undefined)
const authStorage = useStorage('auth', {} as { token?: string })
const isLoading = ref(true)
const isAuthorized = computed(() => {
  return Boolean(authStorage.value.token && user.value?.id)
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

  const signIn = async (username: string, password: string) => {
    const { data, error } = await useAsyncGql('signIn', { username, password })
    if (error.value || !data.value?.signIn?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    useGqlToken(data.value?.signIn?.token)
    authStorage.value.token = data.value?.signIn?.token
    await checkAuthValidity()
  }
  const signUp = async (username: string, password: string) => {
    const { data, error } = await useAsyncGql('signUp', { username, password })
    if (error.value || !data.value?.signUp?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    useGqlToken(data.value?.signUp?.token)
    authStorage.value.token = data.value?.signUp?.token
    await checkAuthValidity()
  }
  const createSession = async (name: string, expiryDurationSeconds: number | null, originRestriction: string) => {
    const { data, error } = await useAsyncGql('createSession', { name, expiryDurationSeconds, originRestriction })
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

  return { isLoading, isAuthorized, user, checkAuthValidity, signIn, signUp, signOut, createSession, revokeSession }
}

export default useAuth
