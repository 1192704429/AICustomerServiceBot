<template>
  <img
    class="pay-brand-icon"
    :src="iconUrl"
    :alt="type === 'alipay' ? '支付宝' : '微信支付'"
  >
</template>

<script>
import { getPayIconUrl } from '@/utils/pay'

export default {
  name: 'PayBrandIcon',
  props: {
    type: {
      type: String,
      default: 'wechat',
      validator: v => ['wechat', 'alipay'].includes(v)
    }
  },
  computed: {
    iconUrl() {
      return getPayIconUrl(this.type)
    }
  }
}
</script>

<style scoped lang="scss">
.pay-brand-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}
</style>
