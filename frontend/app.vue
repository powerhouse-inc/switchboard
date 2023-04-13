<template>
  <NMessageProvider>
    <div class="h-screen flex flex-col">
      <LayoutTheHeader :user="user" :is-authorized="isAuthorized" class="flex-shrink-0 h-14 fixed top-0 z-10" />
      <div class="flex-grow mt-14">
        <NuxtPage :user="user" />
      </div>
    </div>
  </NMessageProvider>
</template>

<script lang="ts" setup>
const { isAuthorized, user } = useAuth()
</script>

<style>
html, body {
  @apply bg-neutral-50;
}
</style>
