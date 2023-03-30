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
  Document24Filled,
  VideoPerson24Filled,
  Play24Filled
} from '@vicons/fluent'

const links = [
  {
    id: '/',
    icon: Document24Filled,
    label: 'Documentation'
  },
  {
    id: '/user',
    icon: VideoPerson24Filled,
    label: 'API Token Generation'
  },
  {
    id: '/graphql-playground',
    icon: Play24Filled,
    label: 'GraphQL Playground',
    disabled: true
  }
]
</script>
