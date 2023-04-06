<template>
  <div class="h-full flex items-center justify-center p-5 md:p-10">
    <div class="w-full h-full max-w-screen-2xl flex flex-col gap-10">
      <AuthWrapperContainer>
        <SessionContainer v-slot="{ sessions, createSession, revokeSession }">
          <AuthUserMenu />
          <div class="w-full bg-white p-5 pt-4">
            <div class="mb-2 font-semibold">
              Create new token
            </div>
            <AuthSessionForm :create-session="createSession" />
          </div>
          <div class="w-full bg-white p-5 pt-4">
            <div class="mb-2 font-semibold">
              Existing tokens
            </div>
            <AuthSessionTable
              :sessions="sessions"
              :revoke-session="revokeSession"
            />
          </div>
        </SessionContainer>
      </AuthWrapperContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SessionContainer from '~/containers/SessionContainer.vue'
</script>
