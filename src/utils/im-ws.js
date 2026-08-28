/**
 * 企业坐席 IM WebSocket 客户端（/ws/im）
 * 支持：连接队列、心跳、断线重连、订阅恢复
 */
export function createImWs(agentUserId, handlers = {}) {
  const base = process.env.VUE_APP_BASE_API || 'http://localhost:8088'
  const wsBase = String(base).replace(/^http/, 'ws')
  const rawId = agentUserId == null ? '' : String(agentUserId)
  if (!rawId) {
    throw new Error('agentUserId 不能为空')
  }
  const userId = rawId.startsWith('agent.') ? rawId : `agent.${rawId}`
  const url = `${wsBase}/ws/im?userId=${encodeURIComponent(userId)}`

  let ws = null
  let closed = false
  let reconnectTimer = null
  let heartbeatTimer = null
  let reconnectAttempt = 0
  const pending = []
  const subscriptions = new Set()

  const clearTimers = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  const flush = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    while (pending.length) {
      ws.send(JSON.stringify(pending.shift()))
    }
  }

  const sendPayload = (payload) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    } else {
      pending.push(payload)
    }
  }

  const startHeartbeat = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 25000)
  }

  const scheduleReconnect = () => {
    if (closed || reconnectTimer) return
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 15000)
    reconnectAttempt += 1
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, delay)
  }

  const connect = () => {
    if (closed) return
    try {
      ws = new WebSocket(url)
    } catch (e) {
      scheduleReconnect()
      return
    }

    ws.onopen = () => {
      reconnectAttempt = 0
      flush()
      // 重连后恢复订阅
      subscriptions.forEach((channel) => {
        ws.send(JSON.stringify({ type: 'subscribe', channel }))
      })
      startHeartbeat()
      handlers.onopen && handlers.onopen()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'pong') return
        handlers.onmessage && handlers.onmessage(data)
      } catch (e) {
        // ignore
      }
    }

    ws.onerror = () => {
      handlers.onerror && handlers.onerror()
    }

    ws.onclose = () => {
      clearTimers()
      handlers.onclose && handlers.onclose()
      if (!closed) {
        scheduleReconnect()
      }
    }
  }

  connect()

  return {
    get readyState() {
      return ws ? ws.readyState : WebSocket.CLOSED
    },
    subscribe(channel) {
      if (!channel) return
      subscriptions.add(channel)
      sendPayload({ type: 'subscribe', channel })
    },
    unsubscribe(channel) {
      if (!channel) return
      subscriptions.delete(channel)
      sendPayload({ type: 'unsubscribe', channel })
    },
    send(channel, content, to) {
      if (!channel || !content) {
        throw new Error('参数不完整')
      }
      if ((!ws || ws.readyState !== WebSocket.OPEN) && !pending.length && subscriptions.size === 0) {
        // 仍允许入队；真正未连接时由上层根据 error 回包处理
      }
      if (closed) {
        throw new Error('WebSocket 已关闭')
      }
      const payload = { type: 'send', channel, content }
      if (to) payload.to = to
      sendPayload(payload)
    },
    close() {
      closed = true
      clearTimers()
      pending.length = 0
      subscriptions.clear()
      try {
        if (ws) ws.close()
      } catch (e) {
        // ignore
      }
    }
  }
}
