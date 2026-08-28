import request from '@/utils/request'

export function pageKnowledgeType(current, size, params) {
  return request({
    url: `/knowledge_type/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

export function listKnowledgeType(params) {
  return request({
    url: '/knowledge_type/list',
    method: 'post',
    data: params || {}
  })
}

export function getKnowledgeTypeById(id) {
  return request({
    url: '/knowledge_type/' + id,
    method: 'get'
  })
}

export function saveKnowledgeType(data) {
  return request({
    url: '/knowledge_type',
    method: 'post',
    data: data
  })
}

export function updateKnowledgeType(data) {
  return request({
    url: '/knowledge_type',
    method: 'put',
    data: data
  })
}

export function deleteKnowledgeType(id) {
  return request({
    url: '/knowledge_type/' + id,
    method: 'delete'
  })
}

export function deleteBatchKnowledgeType(ids) {
  return request({
    url: '/knowledge_type/batch',
    method: 'delete',
    data: ids
  })
}
