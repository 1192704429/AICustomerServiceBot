import request from '@/utils/request'

// 分页查询企业管理列表（current、size 放路径参数，其余放 body）
export function pageEnterpriseInfo(current, size, params) {
  return request({
    url: `/enterprise_info/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询企业管理详情
export function getEnterpriseInfoById(id) {
  return request({
    url: '/enterprise_info/' + id,
    method: 'get'
  })
}

// 新增企业管理
export function saveEnterpriseInfo(data) {
  return request({
    url: '/enterprise_info',
    method: 'post',
    data: data
  })
}

// 修改企业管理
export function updateEnterpriseInfo(data) {
  return request({
    url: '/enterprise_info',
    method: 'put',
    data: data
  })
}

// 审核企业：status 1-通过 0-驳回
export function auditEnterpriseInfo(id, status) {
  return request({
    url: `/enterprise_info/audit/${id}?status=${status}`,
    method: 'put'
  })
}

// 删除企业管理
export function deleteEnterpriseInfo(ids) {
  return request({
    url: '/enterprise_info/' + ids,
    method: 'delete'
  })
}

// 批量删除企业管理
export function deleteBatchEnterpriseInfo(ids) {
  return request({
    url: '/enterprise_info/batch',
    method: 'delete',
    data: ids
  })
}
