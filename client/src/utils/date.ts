const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/** Bucket label used to group conversations in the sidebar. */
export const getDateGroup = (iso: string) => {
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / DAY_MS)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'Previous 7 days'
  if (diffDays < 30) return 'Previous 30 days'
  return 'Older'
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
