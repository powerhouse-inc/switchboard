<template>
  <div class="h-full p-5 md:p-10">
    <div class="h-full flex items-center justify-center">
      <div class="w-full h-full bg-white max-w-screen-2xl flex items-center justify-center">
        <AuthWrapperContainer v-slot="{ user }">
          <pre class="w-1/2 break-words whitespace-break-spaces">User: {{ user }}</pre>
        </AuthWrapperContainer>
      </div>
    </div>
  </div>
</template>
