<template>
  <form class="flex items-center gap-5" @submit.prevent="create">
    <n-input v-model:value="name" placeholder="Name" />
    <n-input v-model:value="expiryDurationSeconds" placeholder="Duration" />
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

const isCreating = ref(false)
const name = ref('')
const expiryDurationSeconds = ref('')

const create = async () => {
  isCreating.value = true
  try {
    await props.createSession(name.value, expiryDurationSeconds.value)
  } finally {
    isCreating.value = false
  }
}
</script>
