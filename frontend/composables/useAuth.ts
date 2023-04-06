import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import decode from 'jwt-decode'

const useAuth = function () {
  const user = useStorage('userstore', {} as any)
  const isLoading = ref(true)

  const check = async () => {
    useGqlToken(user.value?.token)
    const { data, error } = await useAsyncGql('me')
    if (error.value) {
      user.value = {}
    }
    user.value = { ...user.value, ...data.value?.me }
    isLoading.value = false
  }

  const signIn = async (username: string, password: string) => {
    const { data, error } = await useAsyncGql('signIn', { username, password })
    if (error.value || !data.value?.signIn?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    user.value.token = data.value?.signIn?.token
    await check()
  }
  const signUp = async (username: string, password: string) => {
    const { data, error } = await useAsyncGql('signUp', { username, password })
    if (error.value || !data.value?.signUp?.token) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    user.value.token = data.value?.signUp?.token
    await check()
  }
  const signOut = async () => {
    if (!user.value?.token) {
      throw new Error('No user token provided')
    }
    const payload = decode(user.value?.token) as { sessionId?: string } | undefined
    if (!payload || !payload.sessionId) {
      throw new Error('Token has invalid format')
    }
    const { data, error } = await useAsyncGql('revokeSession', { sessionId: payload.sessionId })
    if (error.value || !data.value?.revokeSession?.id) {
      throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
    }
    user.value.token = undefined
    await check()
  }

  return { user, isLoading, check, signIn, signUp, signOut }
}

export default useAuth
