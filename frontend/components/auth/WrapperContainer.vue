<template>
  <div v-if="isLoading" class="w-full h-full bg-white flex items-center justify-center">
    Loading...
  </div>
  <div v-else-if="!isAuthorized" class="w-full h-full bg-white flex items-center justify-center">
    <AuthSignInWithEthereum :sign-in="signIn" :sign-out="signOut" class="w-128" />
  </div>
  <slot v-else :user="user" />
</template>

<script lang="ts" setup>
const { isLoading, isAuthorized, user, signIn, signOut } = useAuth()
</script>
