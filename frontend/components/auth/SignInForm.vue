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
    <form class="flex flex-col gap-4" @submit.prevent="activeId === 'sign-in' ? signInAndAwait() : signUpAndAwait()">
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
        {{ activeId === 'sign-in' ? 'Sign in' : 'Sign up' }}
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
    default: true
  },
  signIn: {
    type: Function,
    required: true
  },
  signUp: {
    type: Function,
    required: true
  }
})

const activeId = ref('sign-in')
const username = ref('')
const password = ref('')
const isLoading = ref(false)

const signInAndAwait = async () => {
  try {
    isLoading.value = true
    await props.signIn(username.value, password.value)
  } catch (error: any) {
    message.error(`Sign in error: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const signUpAndAwait = async () => {
  try {
    isLoading.value = true
    await props.signUp(username.value, password.value)
  } catch (error: any) {
    message.error(`Sign up error: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>
