<script setup lang="ts">
const { data: documentation } = await useAsyncData('blogToc', () =>
  queryContent('/documentation').findOne()
)

const currentlyActiveId = ref(null as string | null)
const content = ref(null)
const tocLinks = computed(() => documentation.value?.body.toc.links ?? [])

const trackCurrentlyActiveId = function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id')
        currentlyActiveId.value = id
      }
    })
  }, {
    root: document,
    rootMargin: '0px 0px -90%',
    threshold: 0
  })
  document
    .querySelectorAll('.markdown-body h2[id], .markdown-body h3[id]')
    .forEach((section) => {
      observer.observe(section)
    })
}

onMounted(trackCurrentlyActiveId)
</script>

<template>
  <div ref="content" class="w-full max-w-screen-2xl m-auto">
    <ContentDoc path="/documentation" class="w-full">
      <template #default="{doc}">
        <div class="flex flex-row w-full px-4">
          <div class="flex-shrink-0 w-56 py-3 hidden md:block h-screen overflow-x-scroll sticky top-14">
            <DocTableOfContents :toc-links="tocLinks" :currently-active-id="currentlyActiveId" class="pb-14" />
          </div>
          <div class="flex-grow !w-56 p-4 pt-2 mt-4 bg-white w-full">
            <ContentRenderer :value="doc" class="markdown-body w-full" />
          </div>
        </div>
      </template>
    </ContentDoc>
  </div>
</template>
