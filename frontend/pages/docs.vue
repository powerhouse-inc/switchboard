<template>
  <div class="markdown-body h-full p-4 flex flex-wrap justify-center ">
    <ContentDoc path="/documentation" class="w-full lg:w-3/4">
      <template #not-found>
        <h1> Document not found </h1>
      </template>
    </ContentDoc>
  </div>
</template>
