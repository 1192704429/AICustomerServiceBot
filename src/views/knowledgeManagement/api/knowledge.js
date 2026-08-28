import request from '@/utils/request'

export function pageKnowledge(current, size, params) {
  return request({
    url: `/knowledge/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

export function listKnowledge(params) {
  return request({
    url: '/knowledge/list',
    method: 'post',
    data: params || {}
  })
}

export function getKnowledgeById(id) {
  return request({
    url: '/knowledge/' + id,
    method: 'get'
  })
}

export function saveKnowledge(data) {
  return request({
    url: '/knowledge',
    method: 'post',
    data: data
  })
}

export function publishKnowledgeOnline(id) {
  return request({
    url: '/knowledge/online/' + id,
    method: 'put'
  })
}

export function deleteKnowledge(id) {
  return request({
    url: '/knowledge/' + id,
    method: 'delete'
  })
}

export function pageKnowledgeChunks(id, current, size, keyword) {
  const params = new URLSearchParams({ current, size })
  if (keyword) {
    params.append('keyword', keyword)
  }
  return request({
    url: `/knowledge/${id}/chunks/page?${params.toString()}`,
    method: 'get'
  })
}
