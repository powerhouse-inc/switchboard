<template>
  <div v-if="isLoading" class="w-full h-full bg-white flex items-center justify-center">
    Loading...
  </div>
  <div v-else-if="!isAuthorized" class="w-full h-full bg-white flex items-center justify-center">
    <AuthSignInForm :sign-in="signIn" :sign-up="signUp" :sign-out="signOut" class="w-128 pb-20" />
  </div>
  <slot v-else :user="user" />
</template>

<script lang="ts" setup>
const { isLoading, isAuthorized, user, signIn, signUp, signOut } = useAuth()
</script>
