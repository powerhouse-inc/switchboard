<template>
  <div class="w-full flex items-center justify-between bg-secondary px-1">
    <div class="flex-1 flex h-full">
      <nuxt-link to="/" class="LogoLink flex h-full items-center gap-2 py-1">
        <img src="~/assets/logo.png" class="h-full flex-shrink-0">
        <h2 class="text-primary opacity-0 transition duration-300 whitespace-nowrap hidden md:block">
          <n-button
            secondary
            round
            type="primary"
            class="gap-1 !pl-2 px-0 lg:!pl-5"
            icon-placement="right"
          >
            Switchboard API
          </n-button>
        </h2>
      </nuxt-link>
    </div>
    <LayoutTheMenu class="flex-shrink-0" />
    <div class="flex-1 flex h-full justify-end items-center pr-1 gap-1">
      <nuxt-link v-if="isAuthorized" to="/user">
        <n-button
          secondary
          round
          type="primary"
          class="gap-1 !pl-2 px-0 lg:!pl-5"
          icon-placement="right"
        >
          <span class="hidden lg:block capitalize">{{ user?.username }}</span>
          <template #icon>
            <n-icon :component="PersonCircleOutline" />
          </template>
        </n-button>
      </nuxt-link>
      <a :href="repository.url" target="_blank" class="text-primary hover:text-primaryHover transition duration-300">
        <n-icon size="30">
          <LogoGithub />
        </n-icon>
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LogoGithub, PersonCircleOutline } from '@vicons/ionicons5'
import type { User } from '~/composables/useAuth'
import { repository } from '~/package.json'

defineProps({
  isAuthorized: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object as PropType<User>,
    default: undefined
  }
})
</script>

<style scoped>
.LogoLink:hover h2 {
  @apply opacity-100 !important;
}
</style>
