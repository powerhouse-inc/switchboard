<template>
  <div class="h-full">
    <iframe :src="playgroundUrl" class="w-full h-full" />
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig()
const playgroundUrl = config.public.GQL_PLAYGROUND
</script>
