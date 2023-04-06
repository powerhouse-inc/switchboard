<template>
  <div v-if="isLoading" class="flex items-center justify-center">
    Loading...
  </div>
  <div v-else-if="!user?.token" class="flex items-center justify-center">
    <AuthSignInForm :sign-in="signIn" :sign-up="signUp" :sign-out="signOut" class="w-128 pb-20" />
  </div>
  <slot v-else :user="user" />
</template>

<script lang="ts" setup>
const { user, isLoading, check, signIn, signUp, signOut } = useAuth()
onMounted(async () => {
  await nextTick()
  check()
})
</script>
