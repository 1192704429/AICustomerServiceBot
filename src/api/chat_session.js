import request from '@/utils/request'

// 分页查询会话详情管理列表（current、size 放路径参数，其余放 body）
export function pageChatSession(current, size, params) {
  return request({
    url: `/chat_session/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询会话详情管理详情
export function getChatSessionById(id) {
  return request({
    url: '/chat_session/' + id,
    method: 'get'
  })
}

// 新增会话详情管理
export function saveChatSession(data) {
  return request({
    url: '/chat_session',
    method: 'post',
    data: data
  })
}

// 修改会话详情管理
export function updateChatSession(data) {
  return request({
    url: '/chat_session',
    method: 'put',
    data: data
  })
}

// 删除会话详情管理
export function deleteChatSession(ids) {
  return request({
    url: '/chat_session/' + ids,
    method: 'delete'
  })
}

// 批量删除会话详情管理
export function deleteBatchChatSession(ids) {
  return request({
    url: '/chat_session/batch',
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

// 下拉选项：关联机器人
export function listAiRobot(data) {
  return request({
    url: '/ai_robot/list',
    method: 'post',
    data: data || {}
  })
}

// 下拉选项：访问渠道
export function listWebsiteChannel(data) {
  return request({
    url: '/website_channel/list',
    method: 'post',
    data: data || {}
  })
}

// 下拉选项：接管用户
export function listSysUser(data) {
  return request({
    url: '/sys_user/list',
    method: 'post',
    data: data || {}
  })
}
