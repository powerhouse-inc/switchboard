import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import decode from 'jwt-decode'

export declare interface User {
    id: string;
    username: string;
}

const user = ref(undefined as User | undefined)
const isLoading = ref(false)
const authStorage = useStorage('auth', {} as { token?: string })
const isAuthorized = computed(() => {
  return Boolean(authStorage.value.token && user.value?.id)
})

const useAuth = function () {
  const check = async () => {
    if (user.value) {
      return
    }
    if (authStorage.value?.token) {
      useGqlToken(authStorage.value?.token)
    }
    const { data, error } = await useAsyncGql('me')
    if (error.value || !data.value?.me) {
      user.value = undefined
      return
    }
    user.value = data.value?.me
    isLoading.value = false
  }

  const signIn = async (username: string, password: string) => {
    const { data, error } = await useAsyncGql('signIn', { username, password })
    if (error.value || !data.value?.signIn?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    authStorage.value.token = data.value?.signIn?.token
    await check()
  }
  const signUp = async (username: string, password: string) => {
    const { data, error } = await useAsyncGql('signUp', { username, password })
    if (error.value || !data.value?.signUp?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    authStorage.value.token = data.value?.signUp?.token
    await check()
  }
  const signOut = async () => {
    if (!authStorage.value?.token) {
      throw new Error('No user token provided')
    }
    useGqlToken(authStorage.value?.token)
    const payload = decode(authStorage.value?.token) as { sessionId?: string } | undefined
    if (!payload || !payload.sessionId) {
      throw new Error('Token has invalid format')
    }
    const { data, error } = await useAsyncGql('revokeSession', { sessionId: payload.sessionId })
    if (error.value || !data.value?.revokeSession?.id) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    authStorage.value.token = undefined
    await check()
  }

  onMounted(async () => {
    await nextTick()
    check()
  })

  return { isLoading, isAuthorized, user, check, signIn, signUp, signOut }
}

export default useAuth
