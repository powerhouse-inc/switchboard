<template>
  <div class="h-full">
    <div
      class="h-full flex items-center gap-1 p-2 hover:text-primary transition duration-300"
      :class="{'text-primary': id === activeId }"
    >
      <NIcon v-if="icon" size="22">
        <Component :is="icon" />
      </NIcon>
      <div class="whitespace-nowrap">
        {{ label }}
      </div>
    </div>
    <div class="h-1 w-full -translate-y-1" :class="{'bg-primary': id === activeId }" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ id: string | number, label: string, icon?: Component, activeId?: string }>()
</script>
