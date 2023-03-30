<template>
  <div class="flex items-center justify-between bg-secondary px-1">
    <div class="flex-1 flex h-full">
      <nuxt-link to="/" class="LogoLink flex h-full items-center gap-2 py-1">
        <img src="~/assets/logo.png" class="h-full flex-shrink-0">
        <h2 class="text-primary opacity-0 transition duration-300 whitespace-nowrap hidden md:block">
          Switchboard API
        </h2>
      </nuxt-link>
    </div>
    <LayoutTheMenu class="flex-shrink-0" />
    <div class="flex-1 flex h-full justify-end items-center pr-1">
      <a :href="repository.url" target="_blank" class="hover:text-primary transition duration-300">
        <NIcon size="30">
          <LogoGithub />
        </NIcon>
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LogoGithub } from '@vicons/ionicons5'
import { repository } from '~/package.json'
</script>

<style scoped>
.LogoLink:hover h2 {
  @apply opacity-100 !important;
}
</style>
