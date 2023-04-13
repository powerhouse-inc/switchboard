<template>
  <form class="flex items-end gap-5" @submit.prevent="create">
    <label class="w-full"><span class="font-semibold">Name</span>
      <n-input v-model:value="name" placeholder="Name" />
    </label>
    <label class="w-full"><span class="font-semibold">Duration</span>
      <n-select v-model:value="expiryDurationSeconds" :options="options" clearable placeholder="Please select" />
    </label>
    <label class="w-full"><span class="font-semibold">Origin restriction</span>
      <n-input v-model:value="originRestriction" placeholder="Origin restriction"/>
    </label>
    <n-button
      attr-type="submit"
      type="primary"
      class="!w-52"
      :loading="isCreating"
      :disabled="isCreationDisabed"
    >
      Create new token
    </n-button>
  </form>
  <n-modal :show="!!createdToken">
    <n-card
      style="width: 570px"
      title="Created token"
      size="small"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-neutral-100 p-3 rounded border-2 border-neutral-200">
        {{ createdToken }}
      </div>
      <div class="text-neutral-400 text-sm my-5">
        Note: the token is not stored in our database, so it is only displayed
        once to you. Please make sure you've copied it into a secure place before closing this window
      </div>
      <n-button
        type="primary"
        class="!w-full"
        @click="createdToken = ''"
      >
        I have saved the token
      </n-button>
    </n-card>
  </n-modal>
</template>

<script lang="ts" setup>
import { useMessage, NButton } from 'naive-ui'

const props = defineProps({
  createSession: {
    type: Function,
    required: true
  }
})

const options = [
  {
    label: '1 hour',
    value: 60 * 60
  },
  {
    label: '1 day',
    value: 60 * 60 * 24
  },
  {
    label: '1 week',
    value: 60 * 60 * 24 * 7
  },
  {
    label: '1 month',
    value: 60 * 60 * 24 * 30
  },
  {
    label: '1 year',
    value: 60 * 60 * 24 * 365
  },
  {
    label: 'Non expiring',
    value: undefined
  }
]

const message = useMessage()
const isCreating = ref(false)
const name = ref('')
const expiryDurationSeconds = ref(null)
const originRestriction = ref(null)
const createdToken = ref('')
const isCreationDisabed = computed(() => !name.value || expiryDurationSeconds.value === null || originRestriction.value === null)

const create = async () => {
  isCreating.value = true
  try {
    const token = await props.createSession(name.value, expiryDurationSeconds.value ?? null, originRestriction.value)
    name.value = ''
    expiryDurationSeconds.value = null
    createdToken.value = token
  } catch (error: any) {
    console.error('Failed to create new token', error)
    message.error(`Failed to create new token: ${error?.message}`)
  } finally {
    isCreating.value = false
  }
}
</script>
