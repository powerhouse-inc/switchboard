<script setup lang="ts">
const props = defineProps<{
  tocLinks: Array<{
    id: string;
    text: string;
    children: { id: string; text: string }[];
  }> | null;
}>();

const emit = defineEmits<{ (e: "click", id: string): void }>();

const onClick = (id: string) => {
  emit("click", id);
};
</script>

<template>
  <nav>
    <ul class="ml-0 pl-4">
      <li
        v-for="{ id, text, children } in props.tocLinks"
        :id="`toc-${id}`"
        :key="id"
        class="cursor-pointer text-sm list-none ml-0 mb-2 last:mb-0 hover:bg-gray-100"
        @click="onClick(id)"
      >
        {{ text }}
        <ul v-if="children" class="ml-3 my-2">
          <li
            v-for="{ id: childId, text: childText } in children"
            :id="`toc-${childId}`"
            :key="childId"
            class="cursor-pointer text-xs list-none ml-0 pt-2 last:mb-0 hover:underline"
            @click.stop="onClick(childId)"
          >
            {{ childText }}
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
