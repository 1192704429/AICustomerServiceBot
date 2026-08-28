<template>
  <div class="app-container package-purchase-page">
    <div class="page-header">
      <h2>套餐购买</h2>
      <p>选择适合您企业的机器人套餐，购买后可在「我的订单」中查看支付状态。</p>
    </div>

    <div v-loading="loading" class="package-grid">
      <el-empty v-if="!loading && !packageList.length" description="暂无可购买的套餐" />

      <div
        v-for="item in packageList"
        :key="item.id"
        class="package-card"
      >
        <h3 class="package-card__title">{{ item.packageName }}</h3>
        <p class="package-card__desc">{{ item.packageDesc || '暂无套餐说明' }}</p>

        <ul class="package-card__meta">
          <li>
            <span>机器人数量</span>
            <strong>{{ item.robotLimit }} 个</strong>
          </li>
        </ul>

        <div class="package-card__footer">
          <div class="package-card__price">
            <span class="currency">¥</span>
            <span class="amount">{{ formatPrice(item.packagePrice) }}</span>
          </div>
          <el-button type="primary" plain @click="handlePurchase(item)">立即购买</el-button>
        </div>
      </div>
    </div>

    <el-dialog
      title="确认支付"
      :visible.sync="purchaseOpen"
      width="520px"
      append-to-body
      custom-class="purchase-checkout-dialog"
      @closed="resetPurchaseForm"
    >
      <div v-if="selectedPackage" class="checkout-panel">
        <div class="checkout-order">
          <div class="checkout-order__main">
            <h4>{{ selectedPackage.packageName }}</h4>
            <p>机器人数量 {{ selectedPackage.robotLimit }} 个</p>
          </div>
          <div class="checkout-order__price">
            <span class="currency">¥</span>
            <span class="amount">{{ formatPrice(selectedPackage.packagePrice) }}</span>
          </div>
        </div>

        <div class="checkout-section">
          <div class="checkout-section__title">选择支付方式</div>
          <div class="pay-method-grid">
            <button
              type="button"
              class="pay-method-card"
              :class="{ 'is-active': purchaseForm.payType === 1 }"
              @click="purchaseForm.payType = 1"
            >
              <pay-brand-icon type="wechat" />
              <div class="pay-method-card__text">
                <strong>微信支付</strong>
                <span>推荐使用微信扫码</span>
              </div>
              <i v-if="purchaseForm.payType === 1" class="el-icon-success pay-method-card__check" />
            </button>
            <button
              type="button"
              class="pay-method-card"
              :class="{ 'is-active': purchaseForm.payType === 2 }"
              @click="purchaseForm.payType = 2"
            >
              <pay-brand-icon type="alipay" />
              <div class="pay-method-card__text">
                <strong>支付宝</strong>
                <span>跳转支付宝收银台</span>
              </div>
              <i v-if="purchaseForm.payType === 2" class="el-icon-success pay-method-card__check" />
            </button>
          </div>
        </div>
      </div>

      <div slot="footer" class="checkout-footer">
        <div class="checkout-footer__amount">
          应付：<em>¥ {{ selectedPackage ? formatPrice(selectedPackage.packagePrice) : '0.00' }}</em>
        </div>
        <div class="checkout-footer__actions">
          <el-button @click="purchaseOpen = false">取 消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitPurchase">立即支付</el-button>
        </div>
      </div>
    </el-dialog>

    <pay-dialog
      :visible.sync="payOpen"
      :pay-type="payContext.payType"
      :order-no="payContext.orderNo"
      :amount="payContext.amount"
      :title="payContext.title"
      :pay-data="payContext.payData"
      @paid="handlePaySuccess"
      @closed="resetPayDialog"
    />
  </div>
</template>

<script>
import { listRobotPackage } from '@/api/robot_package'
import { purchasePackage } from '@/api/package_order'
import PayDialog from '@/components/PayDialog'
import PayBrandIcon from '@/components/PayBrandIcon'

export default {
  name: 'PackagePurchase',
  components: { PayDialog, PayBrandIcon },
  data() {
    return {
      loading: false,
      submitting: false,
      packageList: [],
      purchaseOpen: false,
      payOpen: false,
      payContext: {
        payType: 1,
        orderNo: '',
        amount: 0,
        title: '',
        payData: ''
      },
      selectedPackage: null,
      purchaseForm: {
        payType: 1
      }
    }
  },
  created() {
    this.loadPackages()
  },
  methods: {
    loadPackages() {
      this.loading = true
      listRobotPackage({ status: 1 }).then(response => {
        this.packageList = response.data || []
      }).finally(() => {
        this.loading = false
      })
    },
    formatPrice(price) {
      if (price == null || price === '') return '0.00'
      return Number(price).toFixed(2)
    },
    handlePurchase(pkg) {
      this.selectedPackage = pkg
      this.purchaseForm.payType = 1
      this.purchaseOpen = true
    },
    resetPurchaseForm() {
      this.selectedPackage = null
      this.purchaseForm.payType = 1
    },
    resetPayDialog() {
      this.payContext = {
        payType: 1,
        orderNo: '',
        amount: 0,
        title: '',
        payData: ''
      }
    },
    handlePaySuccess() {
      this.$message.success('支付成功，机器人配额已增加')
    },
    openPayDialog(payType, payResult) {
      const pkg = this.selectedPackage || {}
      this.payContext = {
        payType,
        orderNo: payResult.orderNo || '',
        amount: pkg.packagePrice || 0,
        title: pkg.packageName ? `套餐购买 - ${pkg.packageName}` : '套餐购买',
        payData: payResult.payData || ''
      }
      this.purchaseOpen = false
      this.payOpen = true
    },
    submitPurchase() {
      if (!this.selectedPackage) return
      if (!this.purchaseForm.payType) {
        this.$message.warning('请选择支付方式')
        return
      }

      this.submitting = true
      purchasePackage({
        packageId: this.selectedPackage.id,
        payType: this.purchaseForm.payType,
        payMethod: 'PC'
      }).then(response => {
        this.openPayDialog(this.purchaseForm.payType, response.data || {})
      }).finally(() => {
        this.submitting = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.package-purchase-page {
  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .package-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    min-height: 200px;
  }

  .package-card {
    display: flex;
    flex-direction: column;
    padding: 24px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: #dcdfe6;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    &__title {
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    &__desc {
      flex: 1;
      margin: 0 0 16px;
      min-height: 40px;
      font-size: 14px;
      line-height: 1.6;
      color: #606266;
    }

    &__meta {
      margin: 0 0 20px;
      padding: 0;
      list-style: none;

      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-top: 1px solid #f2f3f5;
        font-size: 14px;
        color: #606266;

        strong {
          color: #303133;
          font-weight: 500;
        }
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #f2f3f5;
    }

    &__price {
      color: #f56c6c;
      line-height: 1;

      .currency {
        font-size: 14px;
        margin-right: 2px;
      }

      .amount {
        font-size: 28px;
        font-weight: 600;
      }
    }
  }
}
</style>

<style lang="scss">
.purchase-checkout-dialog {
  .el-dialog__body {
    padding-top: 12px;
  }

  .checkout-panel {
    padding: 0 4px;
  }

  .checkout-order {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    padding: 18px 20px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 8px;

    &__main {
      h4 {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #909399;
      }
    }

    &__price {
      color: #f56c6c;
      white-space: nowrap;

      .currency {
        font-size: 16px;
        font-weight: 600;
      }

      .amount {
        font-size: 28px;
        font-weight: 700;
      }
    }
  }

  .checkout-section__title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .pay-method-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pay-method-card {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:hover {
      border-color: #c0c4cc;
    }

    &.is-active {
      border-color: #409eff;
      background: #f5f9ff;
      box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.15);
    }

    &__text {
      flex: 1;
      min-width: 0;

      strong {
        display: block;
        font-size: 15px;
        color: #303133;
        line-height: 1.4;
      }

      span {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: #909399;
      }
    }

    &__check {
      font-size: 20px;
      color: #409eff;
      flex-shrink: 0;
    }
  }

  .checkout-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    &__amount {
      font-size: 14px;
      color: #606266;

      em {
        font-style: normal;
        font-size: 20px;
        font-weight: 700;
        color: #f56c6c;
      }
    }

    &__actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
