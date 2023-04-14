<script setup lang="ts">
const { data: blogPost } = await useAsyncData('blogToc', () =>
  queryContent('/documentation').findOne()
)

const tocLinks = computed(() => blogPost.value?.body.toc.links ?? [])

</script>
<template>
  <div class="w-full max-w-screen-2xl m-auto">
    <ContentDoc path="/documentation" class="w-full">
      <template #default="{doc}">
        <div class="flex flex-row w-full px-4">
          <div class="flex-shrink-0 w-56 py-3 hidden md:block h-screen overflow-x-scroll sticky top-14">
            <DocTableOfContents :toc-links="tocLinks" class="pb-14" />
          </div>
          <div class="flex-grow w-[calc(100vw-18rem)] p-4 pt-2 mt-4 bg-white w-full">
            <ContentRenderer :value="doc" class="markdown-body w-full" />
          </div>
        </div>
      </template>
    </ContentDoc>
  </div>
</template>
