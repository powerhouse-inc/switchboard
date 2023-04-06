<template>
  <NMessageProvider>
    <div class="h-screen flex flex-col">
      <LayoutTheHeader :user="user" :is-authorized="isAuthorized" class="flex-shrink-0 h-14" />
      <div class="flex-grow">
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
