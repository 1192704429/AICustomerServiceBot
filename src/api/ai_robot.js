import request from '@/utils/request'

// 分页查询机器人管理列表（current、size 放路径参数，其余放 body）
export function pageAiRobot(current, size, params) {
  return request({
    url: `/ai_robot/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询机器人管理详情
export function getAiRobotById(id) {
  return request({
    url: '/ai_robot/' + id,
    method: 'get'
  })
}

// 新增机器人管理
export function saveAiRobot(data) {
  return request({
    url: '/ai_robot',
    method: 'post',
    data: data
  })
}

// 修改机器人管理
export function updateAiRobot(data) {
  return request({
    url: '/ai_robot',
    method: 'put',
    data: data
  })
}

// 删除机器人管理
export function deleteAiRobot(ids) {
  return request({
    url: '/ai_robot/' + ids,
    method: 'delete'
  })
}

// 批量删除机器人管理
export function deleteBatchAiRobot(ids) {
  return request({
    url: '/ai_robot/batch',
    method: 'delete',
    data: ids
  })
}

// 启用机器人
export function enableAiRobot(id) {
  return request({
    url: '/ai_robot/enable/' + id,
    method: 'put'
  })
}

// 停用机器人
export function disableAiRobot(id) {
  return request({
    url: '/ai_robot/disable/' + id,
    method: 'put'
  })
}

// 检查机器人上线条件
export function checkAiRobotEnable(id) {
  return request({
    url: '/ai_robot/' + id + '/enable-check',
    method: 'get'
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
