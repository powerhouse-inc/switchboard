<template>
  <div class="markdown-body w-full">
    <ContentDoc path="/documentation">
      <template #default="{doc}">
        <div class="flex flex-row w-full">
            <div class="flex flex-col w-1/4 m-4 hidden lg:block h-full sticky top-0">
                <h3> Table of contents </h3>
                <div class="overflow-y-scroll border rounded-md TableOfContents">
                    <div class="items-center">
                        <DocTableOfContents/>
                    </div>
                </div>
            </div>
            <div class="w-3/4 sm:max-lg:w-full p-4">
                <ContentRenderer :value="doc"/>
            </div>
        </div>
      </template>
    </ContentDoc>
  </div>
</template>

<style scoped>
.TableOfContents {
  height: 90vh;
}
</style>
