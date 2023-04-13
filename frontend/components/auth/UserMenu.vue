<template>
  <div v-if="isAuthorized" class="w-full bg-white items-center justify-between pl-5 pr-1 flex">
    <BaseMenuItem id="api-tokens" label="API Tokens" active-id="api-tokens" class="flex-grow-0 w-auto" />
    <n-button
      round
      quaternary
      type="primary"
      icon-placement="right"
      class="!pr-3"
      @click="signOut"
    >
      Sign Out
      <template #icon>
        <n-icon><LogOutOutline /></n-icon>
      </template>
    </n-button>
  </div>
</template>

<script lang="ts" setup>
import { LogOutOutline } from '@vicons/ionicons5'

const { isAuthorized, signOut } = useAuth()
</script>
