<script setup lang="ts">

const router = useRouter();

const { data: blogPost } = await useAsyncData(`blogToc`, () =>
  queryContent(`/documentation`).findOne()
);
const tocLinks = computed(() => blogPost.value?.body.toc.links ?? []);

const onClick = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    router.push({ hash: `#${id}` });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

</script>

<template>
    <nav class="border-black">
      <ul class="ml-0 pl-4">
        <li
          v-for="{ id, text, children } in tocLinks"
          :id="`toc-${id}`"
          :key="id"
          class="cursor-pointer text-sm list-none ml-0 mb-2 last:mb-0"
          @click="onClick(id)"
        >
          {{ text }}
          <ul v-if="children" class="ml-3 my-2">
            <li
              v-for="{ id: childId, text: childText } in children"
              :id="`toc-${childId}`"
              :key="childId"
              class="cursor-pointer text-xs list-none ml-0 mb-2 last:mb-0"
              @click.stop="onClick(childId)"
            >
              {{ childText }}
            </li>
          </ul>
        </li>
      </ul>
    </nav>
</template>

