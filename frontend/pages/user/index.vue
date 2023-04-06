<template>
  <div class="h-full flex items-center justify-center p-5 md:p-10">
    <div class="w-full h-full max-w-screen-2xl flex flex-col gap-10">
      <div v-if="isAuthorized" class="w-full bg-white items-center justify-between pl-5 pr-1 flex">
        <BaseMenuItem id="api-tokens" label="API Tokens" active-id="api-tokens" class="flex-grow-0 w-auto" />
        <n-button
          strong
          round
          quaternary
          type="primary"
          icon-placement="right"
          class="!px-2"
          @click="signOut"
        >
          Sign Out
          <template #icon>
            <n-icon><LogOutOutline /></n-icon>
          </template>
        </n-button>
      </div>
      <div class="w-full h-full bg-white flex items-center justify-center">
        <AuthWrapperContainer>
          <pre class="w-1/2 break-words whitespace-break-spaces">User: {{ user }}</pre>
        </AuthWrapperContainer>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LogOutOutline } from '@vicons/ionicons5'

const { user, isAuthorized, signOut } = useAuth()
</script>
