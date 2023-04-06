<template>
  <div v-if="isLoading" class="flex items-center justify-center">
    Loading...
  </div>
  <div v-else-if="!user?.id" class="flex items-center justify-center">
    <AuthSignInForm :sign-in="signIn" :sign-up="signUp" class="w-128 pb-20" />
  </div>
  <slot v-else :user="user" />
</template>

<script lang="ts" setup>
import { useStorage } from '@vueuse/core'

const isLoading = ref(true)
const user = useStorage('userstore', {} as any)

const check = async () => {
  await nextTick()
  useGqlToken(user.value?.token)
  const { data, error } = await useAsyncGql('me')
  if (error.value) {
    user.value = {}
  }
  user.value = { ...user.value, ...data.value?.me }
  isLoading.value = false
}
onMounted(check)

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
</script>
