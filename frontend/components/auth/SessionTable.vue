<template>
  <n-data-table
    :columns="columns"
    :data="sessions"
    :bordered="true"
    :single-line="false"
  />
</template>

<script lang="ts" setup>
import { format } from 'date-fns'
import { useMessage, NButton } from 'naive-ui'
import { Session } from '~/containers/SessionContainer.vue'

const message = useMessage()

const props = defineProps({
  sessions: {
    type: Array as PropType<Session[]>,
    required: true
  },
  revokeSession: {
    type: Function,
    required: true
  }
})

const formatDate = (dateString?: string): string => {
  if (!dateString) {
    return ''
  }
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm')
}

const formatCommaList = (list: string): string[] => {
    return list.replace(',', ', ');
}

const revoke = async (sessionId: string) => {
  try {
    const referenceTokenId = await props.revokeSession(sessionId)
    message.success(`Succesfully revoked token ${referenceTokenId}`)
  } catch (error: any) {
    message.error(`Session revocation failed: ${error?.message}`)
  }
}

const columns = [
  {
    title: 'Name',
    key: 'name'
  },
  {
    title: 'Type',
    key: 'type',
    render (session: Session) {
      return session.isUserCreated ? 'User created' : 'Browser session'
    }
  },
  {
    title: 'Token',
    key: 'referenceTokenId'
  },
  {
    title: 'Expires At',
    key: 'referenceExpiryDate',
    render (session: Session) {
      if (session.referenceExpiryDate) {
        return formatDate(session.referenceExpiryDate)
      }
      return 'never'
    }
  },
  {
    title: 'Origin restriction',
    key: 'originRestriction',
    render (session: Session) {
        return formatCommaList(session.originRestriction)
    }
  },
  {
    title: 'Status',
    key: 'status',
    render (session: Session) {
      if (session.revokedAt) {
        return `Revoked at ${formatDate(session.revokedAt)}`
      }
      const isExpired = session.referenceExpiryDate
        ? Date.now() > new Date(session.referenceExpiryDate).getTime()
        : false
      if (isExpired) {
        return `Expired at ${formatDate(session.referenceExpiryDate)}`
      }
      return `Active since ${formatDate(session.createdAt)}`
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    render (session: Session) {
      if (session.revokedAt) {
        return
      }
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => revoke(session?.id)
        },
        { default: () => 'Revoke' }
      )
    }
  }
]
</script>
