<template>
  <span>{{ shortenAddress }}</span>
</template>

<script lang="ts" setup>
const props = defineProps({
  address: {
    type: String,
    default: ''
  }
})

const TRIM_LENGTH = 4

const shortenAddress = computed(() => {
  if (!props.address) {
    return ''
  }
  const start = props.address.substr(0, TRIM_LENGTH + 1)
  const end = props.address.substr(-TRIM_LENGTH)
  return `${start}...${end}`
})
</script>
