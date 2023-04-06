<template>
  <div v-if="areSessionsLoading" class="flex items-center justify-center">
    Loading...
  </div>
  <slot v-else :sessions="sessions" />
</template>

<script lang="ts" setup>
interface Session {
  id: string;
  createdAt: any;
  createdBy: string;
  referenceExpiryDate?: any;
  referenceTokenId: string;
  isUserCreated: boolean;
  name?: string | null | undefined;
  revokedAt?: any;
}

const sessions = ref([{ id: 'test' }] as Session[])
const areSessionsLoading = ref(false)

const getSessions = async () => {
  const { data, error } = await useAsyncGql('getSessions')
  if (error.value || !data.value?.sessions) {
    throw new Error(error.value?.gqlErrors?.[0]?.message ?? 'Unknown error')
  }
  sessions.value = data.value?.sessions as Session[]
}

onMounted(getSessions)
</script>
