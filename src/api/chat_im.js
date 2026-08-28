import request from '@/utils/request'

export function getQueueBind() {
  return request({
    url: '/chat/im/queue/bind',
    method: 'get'
  })
}

export function listActiveSessions() {
  return request({
    url: '/chat/im/sessions/active',
    method: 'get'
  })
}

export function getSessionBindInfo(sessionId) {
  return request({
    url: `/chat/im/session/${sessionId}`,
    method: 'get'
  })
}

export function takeoverSession(sessionId) {
  return request({
    url: `/chat/im/session/${sessionId}/takeover`,
    method: 'post',
    data: {}
  })
}

export function releaseSessionToBot(sessionId) {
  return request({
    url: `/chat/im/session/${sessionId}/release`,
    method: 'post',
    data: {}
  })
}

export function endSession(sessionId) {
  return request({
    url: `/chat/im/session/${sessionId}/end`,
    method: 'post'
  })
}
