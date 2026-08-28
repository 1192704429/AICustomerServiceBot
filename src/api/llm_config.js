import request from '@/utils/request'

// 分页查询大模型配置列表（current、size 放路径参数，其余放 body）
export function pageLlmConfig(current, size, params) {
  return request({
    url: `/llm_config/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询大模型配置列表（不分页）
export function listLlmConfig(params) {
  return request({
    url: '/llm_config/list',
    method: 'post',
    data: params || {}
  })
}

// 获取当前企业启用的大模型配置
export function getEnabledLlmConfig() {
  return request({
    url: '/llm_config/enabled',
    method: 'get'
  })
}

// 查询大模型配置详情
export function getLlmConfigById(id) {
  return request({
    url: '/llm_config/' + id,
    method: 'get'
  })
}

// 新增大模型配置
export function saveLlmConfig(data) {
  return request({
    url: '/llm_config',
    method: 'post',
    data: data
  })
}

// 修改大模型配置
export function updateLlmConfig(data) {
  return request({
    url: '/llm_config',
    method: 'put',
    data: data
  })
}

// 启用指定大模型配置
export function enableLlmConfig(id) {
  return request({
    url: '/llm_config/enable/' + id,
    method: 'put'
  })
}

// 删除大模型配置
export function deleteLlmConfig(ids) {
  return request({
    url: '/llm_config/' + ids,
    method: 'delete'
  })
}

// 批量删除大模型配置
export function deleteBatchLlmConfig(ids) {
  return request({
    url: '/llm_config/batch',
    method: 'delete',
    data: ids
  })
}

// 下拉选项：所属企业
export function listEnterpriseInfo(data) {
  return request({
    url: '/enterprise_info/list',
    method: 'post',
    data: data || {}
  })
}
