<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="440px"
    append-to-body
    :close-on-click-modal="false"
    class="pay-dialog"
    @closed="handleClosed"
  >
    <div class="pay-dialog__body">
      <div v-if="paySuccess" class="pay-success">
        <i class="el-icon-success pay-success__icon" />
        <strong>支付成功</strong>
        <p>套餐已生效，机器人配额已增加</p>
      </div>

      <template v-else>
        <div class="pay-brand" :class="isWechat ? 'pay-brand--wechat' : 'pay-brand--alipay'">
          <pay-brand-icon :type="isWechat ? 'wechat' : 'alipay'" />
          <div class="pay-brand__text">
            <strong>{{ isWechat ? '微信支付' : '支付宝' }}</strong>
            <span>{{ isWechat ? 'WeChat Pay' : 'Alipay' }}</span>
          </div>
        </div>

        <div class="pay-summary">
          <p v-if="title" class="pay-summary__title">{{ title }}</p>
          <div class="pay-summary__amount">
            <span class="currency">¥</span>
            <span class="value">{{ formatPayAmount(amount) }}</span>
          </div>
          <p v-if="orderNo" class="pay-summary__order">订单号：{{ orderNo }}</p>
        </div>

        <div v-if="mode === 'wechat'" class="pay-content">
          <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="支付二维码" class="pay-qr">
          <p v-else class="pay-tip pay-tip--warn">未获取到支付二维码，请稍后重试</p>
          <p class="pay-tip">请使用微信扫一扫，扫描上方二维码完成支付</p>
        </div>

        <div v-else-if="mode === 'redirect'" class="pay-content pay-content--center">
          <i class="el-icon-loading pay-loading" />
          <p class="pay-tip">正在打开支付宝收银台…</p>
          <el-button type="primary" plain size="small" @click="openPayUrl">未自动跳转？点击这里</el-button>
        </div>

        <div v-else class="pay-content pay-content--center">
          <i class="el-icon-loading pay-loading" />
          <p class="pay-tip">正在拉起支付，请稍候…</p>
        </div>

        <p v-if="polling" class="pay-tip pay-tip--polling">
          <i class="el-icon-loading" /> 正在等待支付结果…
        </p>
      </template>
    </div>

    <div ref="alipayFormWrap" class="alipay-form-wrap" v-html="payData" />

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ paySuccess ? '完 成' : '关 闭' }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import PayBrandIcon from '@/components/PayBrandIcon'
import { getPackageOrderPayStatus } from '@/api/package_order'
import { buildQrCodeUrl, formatPayAmount, isAlipayForm, isHttpUrl, PAY_POLL_INTERVAL, PAY_POLL_MAX_TIMES } from '@/utils/pay'

export default {
  name: 'PayDialog',
  components: { PayBrandIcon },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    payType: {
      type: Number,
      default: 1
    },
    orderNo: {
      type: String,
      default: ''
    },
    amount: {
      type: [Number, String],
      default: 0
    },
    title: {
      type: String,
      default: ''
    },
    payData: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      mode: 'loading',
      polling: false,
      paySuccess: false,
      pollTimer: null,
      pollCount: 0
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    isWechat() {
      return this.payType === 1
    },
    dialogTitle() {
      if (this.paySuccess) return '支付成功'
      return this.isWechat ? '微信扫码支付' : '支付宝支付'
    },
    qrCodeUrl() {
      if (this.mode !== 'wechat' || !this.payData) return ''
      return buildQrCodeUrl(this.payData)
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.paySuccess = false
        this.pollCount = 0
        this.$nextTick(() => {
          this.setupPay()
          this.startPolling()
        })
      } else {
        this.stopPolling()
      }
    },
    payData() {
      if (this.visible) {
        this.setupPay()
      }
    }
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    formatPayAmount,
    setupPay() {
      const data = this.payData || ''
      if (isAlipayForm(data)) {
        this.mode = 'redirect'
        this.$nextTick(() => {
          const form = this.$refs.alipayFormWrap && this.$refs.alipayFormWrap.querySelector('form')
          if (form) form.submit()
        })
        return
      }
      if (this.payType === 1) {
        this.mode = 'wechat'
        return
      }
      if (isHttpUrl(data)) {
        this.mode = 'redirect'
        window.open(data, '_blank')
        return
      }
      this.mode = 'loading'
    },
    startPolling() {
      this.stopPolling()
      if (!this.orderNo) return
      this.polling = true
      this.pollTimer = setInterval(() => {
        this.checkPayStatus()
      }, PAY_POLL_INTERVAL)
      this.checkPayStatus()
    },
    stopPolling() {
      this.polling = false
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    checkPayStatus() {
      if (!this.orderNo || this.paySuccess) return
      this.pollCount += 1
      if (this.pollCount > PAY_POLL_MAX_TIMES) {
        this.stopPolling()
        return
      }
      getPackageOrderPayStatus(this.orderNo).then(response => {
        const order = response.data
        if (!order || order.orderStatus !== 2) return
        this.onPaySuccess(order)
      }).catch(() => {})
    },
    onPaySuccess(order) {
      if (this.paySuccess) return
      this.paySuccess = true
      this.stopPolling()
      this.$emit('paid', order)
    },
    openPayUrl() {
      if (this.payData && isHttpUrl(this.payData)) {
        window.open(this.payData, '_blank')
      }
    },
    handleClosed() {
      this.mode = 'loading'
      this.paySuccess = false
      this.pollCount = 0
      this.stopPolling()
      this.$emit('closed')
    }
  }
}
</script>

<style scoped lang="scss">
.pay-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 8px;
  }
}

.pay-dialog__body {
  padding: 0 4px;
}

.pay-success {
  padding: 32px 0 16px;
  text-align: center;

  &__icon {
    display: block;
    margin: 0 auto 12px;
    font-size: 56px;
    color: #67c23a;
  }

  strong {
    display: block;
    font-size: 18px;
    color: #303133;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
    color: #909399;
  }
}

.pay-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border-radius: 8px;

  &--wechat {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
  }

  &--alipay {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
  }

  &__icon,
  .pay-brand-icon {
    flex-shrink: 0;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
      font-size: 16px;
      color: #303133;
    }

    span {
      font-size: 12px;
      color: #909399;
    }
  }
}

.pay-summary {
  margin-bottom: 20px;
  padding: 16px;
  text-align: center;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  &__title {
    margin: 0 0 8px;
    font-size: 14px;
    color: #606266;
  }

  &__amount {
    color: #303133;
    line-height: 1;

    .currency {
      font-size: 18px;
      font-weight: 600;
      margin-right: 2px;
    }

    .value {
      font-size: 36px;
      font-weight: 700;
    }
  }

  &__order {
    margin: 12px 0 0;
    font-size: 12px;
    color: #909399;
    word-break: break-all;
  }
}

.pay-content {
  text-align: center;

  &--center {
    padding: 24px 0 8px;
  }
}

.pay-qr {
  width: 240px;
  height: 240px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.pay-tip {
  margin: 14px 0 0;
  font-size: 13px;
  color: #606266;

  &--warn {
    color: #e6a23c;
  }

  &--polling {
    color: #409eff;
  }
}

.pay-loading {
  font-size: 32px;
  color: #409eff;
}

.alipay-form-wrap {
  display: none;
}
</style>
