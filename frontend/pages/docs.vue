<script setup lang="ts">
const router = useRouter()

const onTocClick = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    router.push({ hash: `#${id}` })
    el.scrollIntoView()
  }
}

const { data: blogPost } = await useAsyncData('blogToc', () =>
  queryContent('/documentation').findOne()
)

const tocLinks = computed(() => blogPost.value?.body.toc.links ?? [])

</script>
<template>
  <div class="markdown-body w-full">
    <ContentDoc path="/documentation">
      <template #default="{doc}">
        <div class="flex flex-row w-full">
          <div class="flex flex-col w-1/4 mx-4 hidden lg:block h-full sticky top-0">
            <h3> Table of contents </h3>
            <div class="overflow-y-scroll border rounded-md TableOfContents">
              <div class="items-center">
                <DocTableOfContents :toc-links="tocLinks" @click="onTocClick" />
              </div>
            </div>
          </div>
          <div class="w-3/4 sm:max-lg:w-full p-4">
            <ContentRenderer :value="doc" class="border-black" />
          </div>
        </div>
      </template>
    </ContentDoc>
  </div>
</template>

<style scoped>
.TableOfContents {
  @apply h-[calc(100vh-110px)];
}
</style>
