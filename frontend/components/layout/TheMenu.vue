<template>
  <div class="h-full flex gap-3">
    <template v-for="link of links" :key="link.to">
      <nuxt-link :to="link.id" class="h-full">
        <BaseMenuItem v-bind="link" :active-id="$route.path" />
      </nuxt-link>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  DocumentText24Regular,
  VideoPerson24Filled,
  Play24Regular
} from '@vicons/fluent'

const links = [
  {
    id: '/',
    icon: DocumentText24Regular,
    label: 'Documentation'
  },
  {
    id: '/user',
    icon: VideoPerson24Filled,
    label: 'API Token Generation'
  },
  {
    id: '/graphql-playground',
    icon: Play24Regular,
    label: 'GraphQL Playground',
    disabled: true
  }
]
</script>
