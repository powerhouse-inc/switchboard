<script setup lang="ts">
const props = defineProps<{
  tocLinks: Array<{
    id: string;
    text: string;
    children: { id: string; text: string }[];
  }> | null;
  currentlyActiveId: string | null;
}>()

defineEmits<{(e: 'scrollToId', id: string): void }>()
</script>

<template>
  <nav>
    <ul class="!p-0">
      <li
        v-for="{ id, text, children } in props.tocLinks"
        :id="`toc-${id}`"
        :key="id"
        class="text-sm list-none"
      >
        <template v-if="text !== 'Table of contents'">
          <a
            :href="`#${id}`"
            class="!text-neutral-800"
            :class="{'font-semibold': currentlyActiveId === id }"
            @click="$emit('scrollToId', id)"
          >{{ text }}</a>
          <ul v-if="children" class="!p-0 ml-4 mt-1 mb-2 flex flex-col gap-2">
            <li
              v-for="{ id: childId, text: childText } in children"
              :id="`toc-${childId}`"
              :key="childId"
              class="text-xs list-none ml-0 hover:underline"
            >
              <a
                :href="`#${childId}`"
                class="!text-neutral-700"
                :class="{'font-semibold': currentlyActiveId === childId }"
                @click="$emit('scrollToId', childId)"
              >{{ childText }}</a>
            </li>
          </ul>
        </template>
      </li>
    </ul>
  </nav>
</template>
