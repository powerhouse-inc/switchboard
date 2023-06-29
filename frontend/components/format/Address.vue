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
  const start = props.address.substring(0, TRIM_LENGTH + 1)
  const end = props.address.substring(props.address.length - TRIM_LENGTH)
  return `${start}...${end}`
})
</script>
