import request from '@/utils/request'

// 分页查询用户管理列表（current、size 放路径参数，其余放 body）
export function pageSysUser(current, size, params) {
  return request({
    url: `/sys_user/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询用户管理详情
export function getSysUserById(id) {
  return request({
    url: '/sys_user/' + id,
    method: 'get'
  })
}

// 新增用户管理
export function saveSysUser(data) {
  return request({
    url: '/sys_user',
    method: 'post',
    data: data
  })
}

// 修改用户管理
export function updateSysUser(data) {
  return request({
    url: '/sys_user',
    method: 'put',
    data: data
  })
}

// 删除用户管理
export function deleteSysUser(ids) {
  return request({
    url: '/sys_user/' + ids,
    method: 'delete'
  })
}

// 批量删除用户管理
export function deleteBatchSysUser(ids) {
  return request({
    url: '/sys_user/batch',
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
