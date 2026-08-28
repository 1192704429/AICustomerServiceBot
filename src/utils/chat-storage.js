const KEY_PREFIX = 'ics_chat_'

export function loadChatStorage(channelId) {
  if (!channelId) return {}
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${channelId}`)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

export function saveChatStorage(channelId, data) {
  if (!channelId) return
  const prev = loadChatStorage(channelId)
  localStorage.setItem(`${KEY_PREFIX}${channelId}`, JSON.stringify({
    ...prev,
    ...data
  }))
}

export function clearSessionStorage(channelId) {
  const stored = loadChatStorage(channelId)
  saveChatStorage(channelId, {
    visitorId: stored.visitorId || null,
    sessionId: null
  })
}
