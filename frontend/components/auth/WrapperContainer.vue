<template>
  <div v-if="isLoading" class="flex items-center justify-center">
    Loading...
  </div>
  <div v-else-if="!user?.id" class="flex items-center justify-center">
    <AuthSignInForm :login="login" class="w-128 pb-20" />
  </div>
  <slot v-else :user="user" />
</template>

<script lang="ts" setup>
import { useStorage } from '@vueuse/core'

const user = useStorage('userstore', {} as any)
const isLoading = ref(true)

const check = async () => {
  try {
    user.value = await executeAPI('/api/auth/me')
  } catch (error) {
    user.value = {}
  } finally {
    isLoading.value = false
  }
}
onMounted(check)

const login = async (username: string, password: string) => {
  await executeAPI('/api/auth/init', { method: 'POST', data: { username, password } })
}
</script>
