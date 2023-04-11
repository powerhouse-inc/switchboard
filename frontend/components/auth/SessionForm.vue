<template>
  <form class="flex items-end gap-5" @submit.prevent="create">
    <label class="w-full"><span class="font-semibold">Name</span>
      <n-input v-model:value="name" placeholder="Name" />
    </label>
    <label class="w-full"><span class="font-semibold">Duration</span>
      <n-select v-model:value="expiryDurationSeconds" :options="options" clearable placeholder="Please select" />
    </label>
    <n-button
      attr-type="submit"
      type="primary"
    >
      Create new token
    </n-button>
  </form>
</template>

<script lang="ts" setup>
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

const isCreating = ref(false)
const name = ref('')
const expiryDurationSeconds = ref(60 * 60)

const create = async () => {
  isCreating.value = true
  try {
    await props.createSession(name.value, expiryDurationSeconds.value)
  } finally {
    isCreating.value = false
  }
}
</script>
