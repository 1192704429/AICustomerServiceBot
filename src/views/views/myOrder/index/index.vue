<template>
  <div class="app-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="订单编号">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单编号"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="套餐名称">
          <el-input
            v-model="queryParams.packageName"
            placeholder="请输入套餐名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="queryParams.orderStatus" placeholder="全部" clearable>
            <el-option label="待支付" :value="1" />
            <el-option label="已支付" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="queryParams.payType" placeholder="全部" clearable>
            <el-option label="微信" :value="1" />
            <el-option label="支付宝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="购买人">
          <el-input
            v-model="queryParams.realName"
            placeholder="请输入购买人"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-wrapper">
      <el-table v-loading="loading" :data="packageOrderList" class="modern-table">
        <el-table-column label="订单编号" prop="orderNo" min-width="180" :show-overflow-tooltip="true" fixed="left" />
        <el-table-column label="企业名称" prop="enterpriseName" min-width="140" :show-overflow-tooltip="true" />
        <el-table-column label="套餐名称" prop="packageName" min-width="130" :show-overflow-tooltip="true" />
        <el-table-column label="机器人数量" prop="robotLimit" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.robotLimit != null ? scope.row.robotLimit : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="订单金额" prop="orderAmount" width="110" align="right">
          <template slot-scope="scope">
            ¥ {{ formatPrice(scope.row.orderAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="支付金额" prop="payAmount" width="110" align="right">
          <template slot-scope="scope">
            <span class="pay-amount">¥ {{ formatPrice(scope.row.payAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" prop="payType" width="100" align="center">
          <template slot-scope="scope">
            {{ getEnumLabel(scope.row.payType, payTypeEnumMap) }}
          </template>
        </el-table-column>
        <el-table-column label="购买人" prop="realName" width="100" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.realName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态" prop="orderStatus" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.orderStatus)" size="small">
              {{ getEnumLabel(scope.row.orderStatus, orderStatusEnumMap) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170" :show-overflow-tooltip="true" />
        <el-table-column label="支付时间" prop="payTime" width="170" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.payTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            <el-button
              v-if="scope.row.orderStatus === 1"
              type="text"
              @click="handleContinuePay(scope.row)"
            >继续支付</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog title="订单详情" :visible.sync="detailOpen" width="640px" append-to-body>
      <el-descriptions v-if="detailRow" :column="2" border size="medium">
        <el-descriptions-item label="订单编号" :span="2">{{ detailRow.orderNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailRow.enterpriseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="购买人">{{ detailRow.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="机器人数量">{{ detailRow.robotLimit != null ? detailRow.robotLimit : '-' }}</el-descriptions-item>
        <el-descriptions-item label="套餐名称">{{ detailRow.packageName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="statusTagType(detailRow.orderStatus)" size="small">
            {{ getEnumLabel(detailRow.orderStatus, orderStatusEnumMap) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">¥ {{ formatPrice(detailRow.orderAmount) }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">¥ {{ formatPrice(detailRow.payAmount) }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ getEnumLabel(detailRow.payType, payTypeEnumMap) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detailRow.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ detailRow.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailRow.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="detailRow && detailRow.orderStatus === 1"
          type="primary"
          :loading="paying"
          @click="handleContinuePay(detailRow)"
        >继续支付</el-button>
        <el-button @click="detailOpen = false">关 闭</el-button>
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
import {
  pagePackageOrder,
  getPackageOrderById,
  prepayOrder
} from '@/api/package_order'
import Pagination from '@/components/Pagination'
import PayDialog from '@/components/PayDialog'

export default {
  name: 'MyOrder',
  components: { Pagination, PayDialog },
  data() {
    return {
      loading: false,
      paying: false,
      total: 0,
      packageOrderList: [],
      detailOpen: false,
      detailRow: null,
      payOpen: false,
      payContext: {
        payType: 1,
        orderNo: '',
        amount: 0,
        title: '',
        payData: ''
      },
      queryParams: {
        current: 1,
        size: 10,
        orderNo: null,
        packageName: null,
        orderStatus: null,
        payType: null,
        realName: null
      },
      payTypeEnumMap: { 1: '微信', 2: '支付宝' },
      orderStatusEnumMap: { 1: '待支付', 2: '已支付', 3: '已取消' }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      pagePackageOrder(current, size, { ...rest }).then(response => {
        const pageData = response.data
        this.packageOrderList = pageData.records || []
        this.total = Number(pageData.total) || 0
      }).finally(() => {
        this.loading = false
      })
    },
    formatPrice(price) {
      if (price == null || price === '') return '0.00'
      return Number(price).toFixed(2)
    },
    getEnumLabel(val, map) {
      if (map == null || map[val] === undefined) return val || '-'
      return map[val]
    },
    statusTagType(status) {
      if (status === 1) return 'warning'
      if (status === 2) return 'success'
      if (status === 3) return 'info'
      return ''
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.current = 1
      this.queryParams.orderNo = null
      this.queryParams.packageName = null
      this.queryParams.orderStatus = null
      this.queryParams.payType = null
      this.queryParams.realName = null
      this.handleQuery()
    },
    handleDetail(row) {
      getPackageOrderById(row.id).then(response => {
        this.detailRow = response.data
        this.detailOpen = true
      })
    },
    handleContinuePay(row) {
      if (!row || !row.orderNo) return
      this.paying = true
      prepayOrder({
        orderNo: row.orderNo,
        channel: row.payType,
        payMethod: 'PC'
      }).then(response => {
        this.openPayDialog(row, response.data || {})
      }).finally(() => {
        this.paying = false
      })
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
    handlePaySuccess(order) {
      this.$message.success('支付成功，机器人配额已增加')
      if (this.detailOpen && this.detailRow && order && order.orderNo === this.detailRow.orderNo) {
        this.detailRow = { ...this.detailRow, ...order, orderStatus: 2 }
      }
      this.getList()
    },
    openPayDialog(row, payResult) {
      this.payContext = {
        payType: row.payType,
        orderNo: payResult.orderNo || row.orderNo,
        amount: row.payAmount,
        title: row.packageName ? `套餐购买 - ${row.packageName}` : '订单支付',
        payData: payResult.payData || ''
      }
      this.payOpen = true
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.pay-amount {
  color: #f56c6c;
  font-weight: 500;
}
</style>
