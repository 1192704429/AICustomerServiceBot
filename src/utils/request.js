import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { getClientToken, removeClientToken } from '@/utils/client-auth'

function resolveErrorMessage(payload, fallback) {
    if (!payload) return fallback
    if (typeof payload === 'string') return payload
    return payload.msg || payload.message || fallback
}

function showErrorMessage(message) {
    if (!message || message === 'Error') return
    Message({
        message,
        type: 'error',
        duration: 2 * 1000
    })
}

// 创建axios实例
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API, // 请求地址前缀
    timeout: 20000 // 响应超时时间
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        const authType = config.authType || 'admin'
        const token = authType === 'client' ? getClientToken() : getToken()
        if (token) {
            config.headers['Authorization'] = token
        }
        return config
    },
    error => {
        console.log(error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(

    response => {
        // 如果是 blob 响应（如验证码图片），直接返回
        if (response.config.responseType === 'blob' || response.data instanceof Blob) {
            return response.data
        }

        const res = response.data
        // 如果返回的状态码不是200，就提示错误信息
        if (res.code !== 200) {
            // 用户端鉴权过期：仅处理 client 端，不影响管理员逻辑
            if (res.code === 401 && response.config && response.config.authType === 'client') {
                removeClientToken()
                if (store && store.dispatch) {
                    store.dispatch('clientUser/resetToken').catch(() => {})
                }
                const currentPath = window.location.pathname
                if (currentPath !== '/login') {
                    const redirect = encodeURIComponent(currentPath + (window.location.search || ''))
                    window.location.href = `/login?redirect=${redirect}`
                }
            }
            Message({
                message: res.msg,
                type: 'error',
                duration: 2 * 1000
            })
            return Promise.reject(new Error(resolveErrorMessage(res, 'Error')))
        } else {
            // 如果返回的状态码是200，就直接返回数据
            return res
        }
    },
    error => {
        const message = resolveErrorMessage(error.response && error.response.data, error.message || '请求失败')
        showErrorMessage(message)
        return Promise.reject(error)
    }
)

export default service
