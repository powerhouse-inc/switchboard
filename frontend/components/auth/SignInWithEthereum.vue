<template>
  <div class="flex flex-col gap-3 w-80">
    <NButton
      type="primary"
      :loading="isLoading"
      @click="signInAndAwait"
    >
      Sign in with Ethereum
    </NButton>
  </div>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
//   import { LogInOutline, PersonCircle } from '@vicons/ionicons5'
//   import { LockClosed24Filled, FormNew24Regular } from '@vicons/fluent'

const message = useMessage()

const props = defineProps({
  isSignupEnabled: {
    type: Boolean,
    default: true
  },
  signIn: {
    type: Function,
    required: true
  }
})

const isLoading = ref(false)

const signInAndAwait = async () => {
  try {
    isLoading.value = true
    await props.signIn()
  } catch (error: any) {
    message.error(`Sign in error: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>
