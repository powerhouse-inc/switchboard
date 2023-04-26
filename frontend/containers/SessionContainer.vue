<template>
  <div v-if="areSessionsLoading" class="flex items-center justify-center">
    Loading...
  </div>
  <div v-else-if="errorMessage" class="text-red-500">
    {{ errorMessage }}
  </div>
  <slot v-else :sessions="sessions" :revoke-session="revoke" :create-session="create" />
</template>

<script lang="ts" setup>
export interface Session {
  id: string;
  createdAt: any;
  createdBy: string;
  referenceExpiryDate?: any;
  referenceTokenId: string;
  isUserCreated: boolean;
  name?: string | null | undefined;
  revokedAt?: any;
  allowedOrigins: string;
}

const { createSession, revokeSession } = useAuth()
const sessions = ref([] as Session[])
const errorMessage = ref('')
const areSessionsLoading = ref(true)

const getSessions = async () => {
  try {
    errorMessage.value = ''
    const { data, error } = await useAsyncGql('getSessions')
    if (error.value || !data.value?.sessions) {
      errorMessage.value = error.value?.gqlErrors?.[0]?.message ?? 'Unknown error'
    }
    sessions.value = data.value?.sessions as Session[]
  } finally {
    areSessionsLoading.value = false
  }
}

const revoke = async (sessionId: string) => {
  const referenceTokenId = await revokeSession(sessionId)
  await getSessions()
  return referenceTokenId
}

const create = async (name: string, expiryDurationSeconds: number | null, allowedOrigins: string) => {
  const token = await createSession(name, expiryDurationSeconds, allowedOrigins)
  await getSessions()
  return token
}

onMounted(getSessions)
</script>
