<template>
  <div class="h-screen flex flex-col">
    <LayoutTheHeader class="flex-shrink-0 h-14" />
    <div class="flex-grow">
      <NuxtPage />
    </div>
  </div>
</template>

<style>
html, body {
  @apply bg-neutral-50;
}
</style>
