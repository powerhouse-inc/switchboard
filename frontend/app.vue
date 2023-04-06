<template>
  <NMessageProvider>
    <div class="h-screen flex flex-col">
      <LayoutTheHeader :user="user" class="flex-shrink-0 h-14" />
      <div class="flex-grow">
        <NuxtPage :user="user" />
      </div>
    </div>
  </NMessageProvider>
</template>

<script lang="ts" setup>
const { user } = useAuth()
</script>

<style>
html, body {
  @apply bg-neutral-50;
}
</style>
