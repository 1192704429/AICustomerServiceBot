export function isAlipayForm(payData) {
  return payData && payData.indexOf('<form') !== -1
}

export function isHttpUrl(payData) {
  return payData && /^https?:\/\//i.test(payData)
}

/** 任意支付链接/码内容生成二维码图片地址 */
export function buildQrCodeUrl(content, size = 240) {
  if (!content) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(content)}`
}

export function formatPayAmount(amount) {
  if (amount == null || amount === '') return '0.00'
  return Number(amount).toFixed(2)
}

export const PAY_ICON_WECHAT = require('@/assets/pay/wx.png')

export const PAY_ICON_ALIPAY = require('@/assets/pay/zfb.png')

export function getPayIconUrl(type) {
  return type === 'alipay' ? PAY_ICON_ALIPAY : PAY_ICON_WECHAT
}

export const PAY_POLL_INTERVAL = 3000

export const PAY_POLL_MAX_TIMES = 200
