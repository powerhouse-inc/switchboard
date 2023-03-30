<template>
  <div class="h-full flex gap-3">
    <template v-for="link of links" :key="link.to">
      <nuxt-link :to="link.to" class="h-full">
        <div
          class="h-full flex items-center gap-1 p-2 hover:text-primary transition duration-300"
          :class="{'text-primary': link.to === $route.path }"
        >
          <NIcon v-if="link.icon" size="22">
            <Component :is="link.icon" />
          </NIcon>
          {{ link.label }}
        </div>
        <div class="h-1 w-full -translate-y-1" :class="{'bg-primary': link.to === $route.path }" />
      </nuxt-link>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  DocumentText24Regular,
  VideoPerson24Regular,
  PanelRight24Regular
} from '@vicons/fluent'

const links = [
  {
    to: '/',
    icon: DocumentText24Regular,
    label: 'Documentation'
  },
  {
    to: '/user',
    icon: VideoPerson24Regular,
    label: 'User Space'
  },
  {
    to: '/graphql-playground',
    icon: PanelRight24Regular,
    label: 'GraphQL Playground',
    disabled: true
  }
]
</script>
