<template>
  <div class="flex flex-col">
    <NButton
      type="primary"
      :loading="isLoading"
      @click="signInAndAwait"
    >
      <template #icon>
        <n-icon :component="LogInOutline" class="-ml-1" />
      </template>
      Sign in with Ethereum
    </NButton>
  </div>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { LogInOutline } from '@vicons/ionicons5'

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
