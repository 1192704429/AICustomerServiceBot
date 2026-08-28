import request from '@/utils/request'

export function getChannelInfo(channelId) {
  return request({
    url: `/public/chat/channel/${channelId}`,
    method: 'get'
  })
}

export function createChatSession(data) {
  return request({
    url: '/public/chat/session',
    method: 'post',
    data
  })
}

export function resumeChatSession(data) {
  return request({
    url: '/public/chat/resume',
    method: 'post',
    data
  })
}

export function getChatHistory(channelId, visitorId) {
  return request({
    url: '/public/chat/history',
    method: 'get',
    params: { channelId, visitorId }
  })
}

export function sendChatMessage(data) {
  return request({
    url: '/public/chat/send',
    method: 'post',
    data
  })
}

export function getEmbedCode(id, frontendBase) {
  return request({
    url: `/website_channel/embed/${id}`,
    method: 'get',
    params: { frontendBase }
  })
}
