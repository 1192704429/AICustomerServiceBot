import request from '@/utils/request'

// 分页查询网站渠道管理列表（current、size 放路径参数，其余放 body）
export function pageWebsiteChannel(current, size, params) {
  return request({
    url: `/website_channel/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询网站渠道管理详情
export function getWebsiteChannelById(id) {
  return request({
    url: '/website_channel/' + id,
    method: 'get'
  })
}

// 新增网站渠道管理
export function saveWebsiteChannel(data) {
  return request({
    url: '/website_channel',
    method: 'post',
    data: data
  })
}

// 修改网站渠道管理
export function updateWebsiteChannel(data) {
  return request({
    url: '/website_channel',
    method: 'put',
    data: data
  })
}

// 删除网站渠道管理
export function deleteWebsiteChannel(ids) {
  return request({
    url: '/website_channel/' + ids,
    method: 'delete'
  })
}

// 批量删除网站渠道管理
export function deleteBatchWebsiteChannel(ids) {
  return request({
    url: '/website_channel/batch',
    method: 'delete',
    data: ids
  })
}

export function getWebsiteChannelEmbedCode(id, frontendBase) {
  return request({
    url: `/website_channel/embed/${id}`,
    method: 'get',
    params: { frontendBase }
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

// 下拉选项：关联机器人
export function listAiRobot(data) {
  return request({
    url: '/ai_robot/list',
    method: 'post',
    data: data || {}
  })
}
