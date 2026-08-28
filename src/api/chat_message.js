import request from '@/utils/request'

export function pageChatMessage(current, size, params) {
  return request({
    url: `/chat_message/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

export function listChatMessage(params) {
  return request({
    url: '/chat_message/list',
    method: 'post',
    data: params
  })
}
