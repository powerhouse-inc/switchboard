<template>
  <div class="flex flex-col gap-3 w-80">
    <div class="h-14 gap-3 flex justify-center mb-1">
      <button @click="activeId = 'sign-in'">
        <BaseMenuItem id="sign-in" label="Sign In" :icon="LogInOutline" :active-id="activeId" />
      </button>
      <button v-if="isSignupEnabled" @click="activeId = 'sign-up'">
        <BaseMenuItem id="sign-up" label="Sign Up" :icon="FormNew24Regular" :active-id="activeId" />
      </button>
    </div>
    <form class="flex flex-col gap-4" @submit.prevent="loginAndAwait">
      <n-input
        v-model:value="username"
        autofocus
        type="text"
        class="w-full"
        placeholder="Username"
        :disabled="isLoading"
      >
        <template #prefix>
          <n-icon :component="PersonCircle" class="-ml-1" />
        </template>
      </n-input>
      <n-input
        v-model:value="password"
        autofocus
        type="password"
        class="w-full"
        placeholder="Password"
        :disabled="isLoading"
      >
        <template #prefix>
          <n-icon :component="LockClosed24Filled" class="-ml-1" />
        </template>
      </n-input>
      <NButton
        type="primary"
        attr-type="submit"
        :disabled="!username || !password"
        :loading="isLoading"
      >
        Sign in
      </NButton>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { LogInOutline, PersonCircle } from '@vicons/ionicons5'
import { LockClosed24Filled, FormNew24Regular } from '@vicons/fluent'

const message = useMessage()

const props = defineProps({
  isSignupEnabled: {
    type: Boolean,
    default: false
  },
  signIn: {
    type: Function,
    required: true
  }
})

const activeId = ref('sign-in')
const username = ref('')
const password = ref('')
const isLoading = ref(false)

const loginAndAwait = async () => {
  try {
    isLoading.value = true
    await props.signIn(username.value, password.value)
  } catch (error: any) {
    message.error(`Error while signing in: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>
