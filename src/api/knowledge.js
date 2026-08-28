import request from '@/utils/request'

// 分页查询知识详情列表（current、size 放路径参数，其余放 body）
export function pageKnowledge(current, size, params) {
  return request({
    url: `/knowledge/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询知识详情详情
export function getKnowledgeById(id) {
  return request({
    url: '/knowledge/' + id,
    method: 'get'
  })
}

// 新增知识详情
export function saveKnowledge(data) {
  return request({
    url: '/knowledge',
    method: 'post',
    data: data
  })
}

// 修改知识详情
export function updateKnowledge(data) {
  return request({
    url: '/knowledge',
    method: 'put',
    data: data
  })
}

// 删除知识详情
export function deleteKnowledge(ids) {
  return request({
    url: '/knowledge/' + ids,
    method: 'delete'
  })
}

// 批量删除知识详情
export function deleteBatchKnowledge(ids) {
  return request({
    url: '/knowledge/batch',
    method: 'delete',
    data: ids
  })
}
