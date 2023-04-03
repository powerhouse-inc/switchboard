<template>
  <div class="flex flex-col gap-3 w-80">
    <div class="h-14 gap-3 flex justify-center mb-1">
      <button @click="activeId = 'sign-in'">
        <BaseMenuItem id="sign-in" label="Sign In" :icon="LogInOutline" :active-id="activeId" />
      </button>
      <button @click="activeId = 'sign-up'">
        <BaseMenuItem id="sign-up" label="Sign Up" :icon="FormNew24Regular" :active-id="activeId" />
      </button>
    </div>
    <form class="flex flex-col gap-4" @submit.prevent="loginAndAwait">
      <NInput
        v-model:value="username"
        autofocus
        type="text"
        class="w-full"
        placeholder="Username"
        :disabled="isLoading"
      />
      <NInput
        v-model:value="password"
        autofocus
        type="password"
        class="w-full"
        placeholder="Password"
        :disabled="isLoading"
      />
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
import { LogInOutline } from '@vicons/ionicons5'
import { FormNew24Regular } from '@vicons/fluent'

const message = useMessage()

const props = defineProps({
  login: {
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
    await props.login(username.value, password.value)
  } catch (error: any) {
    message.error(`Error while signing in: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>
