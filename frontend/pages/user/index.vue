<template>
  <div class="h-full flex items-center justify-center p-5 md:p-10">
    <div class="w-full h-full max-w-screen-2xl flex flex-col gap-10">
      <AuthWrapperContainer>
        <AuthUserMenu />
        <div class="w-full bg-white px-5 py-4">
          <strong>Existing tokens</strong>
          <SessionContainer v-slot="{ sessions }">
            <pre>{{ sessions }}</pre>
          </SessionContainer>
        </div>
      </AuthWrapperContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SessionContainer from '~/containers/SessionContainer.vue'
</script>
