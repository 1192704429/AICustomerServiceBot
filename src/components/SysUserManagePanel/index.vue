<template>
  <div class="app-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item v-if="showEnterpriseFilter" label="所属企业">
          <el-select
            v-model="queryParams.enterpriseId"
            placeholder="请选择企业"
            clearable
            filterable
            style="width: 220px;"
          >
            <el-option
              v-for="item in enterpriseInfoOptions"
              :key="item.id"
              :label="item.enterpriseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="登录账号">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入登录账号"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input
            v-model="queryParams.realName"
            placeholder="请输入真实姓名"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号码"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item v-if="showRoleFilter" label="用户角色">
          <el-select v-model="queryParams.roleType" placeholder="请选择用户角色" clearable>
            <el-option
              v-for="item in roleTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="queryParams.status" placeholder="请选择账号状态" clearable>
            <el-option :key="0" label="禁用" :value="0" />
            <el-option :key="1" label="启用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-buttons">
      <el-button type="primary" @click="handleAdd">新建</el-button>
      <el-button :disabled="multiple" @click="handleDeleteBatch">批量删除</el-button>
    </div>

    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="sysUserList"
        @selection-change="handleSelectionChange"
        class="modern-table"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="登录账号" prop="username" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column label="真实姓名" prop="realName" align="center" width="100" show-overflow-tooltip />
        <el-table-column label="头像" prop="avatar" width="80" align="center">
          <template slot-scope="scope">
            <image-preview v-if="scope.row.avatar" :src="scope.row.avatar" width="40px" height="40px" />
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="手机号码" prop="phone" align="center" width="120" show-overflow-tooltip />
        <el-table-column label="电子邮箱" prop="email" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column v-if="showEnterpriseColumn" label="所属企业" prop="enterpriseName" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column label="用户角色" prop="roleType" align="center" width="120">
          <template slot-scope="scope">
            <el-tag size="small" type="info">{{ getEnumLabel(scope.row.roleType, roleTypeEnumMap) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" prop="status" align="center" width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ getEnumLabel(scope.row.status, statusEnumMap) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center" width="160" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="text" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="text" style="color: #f56c6c;" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[5, 10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item v-if="showEnterpriseForm" label="所属企业" prop="enterpriseId">
          <el-select v-model="form.enterpriseId" placeholder="请选择所属企业" clearable filterable style="width: 100%;">
            <el-option
              v-for="item in enterpriseInfoOptions"
              :key="item.id"
              :label="item.enterpriseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="form.id ? '留空则不修改密码' : '请输入登录密码'"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <img-upload v-model="form.avatar" :limit="1" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item v-if="showRoleForm" label="用户角色" prop="roleType">
          <el-select v-model="form.roleType" placeholder="请选择用户角色" clearable style="width: 100%;">
            <el-option
              v-for="item in roleTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="用户详情" :visible.sync="detailOpen" width="720px" append-to-body>
      <el-descriptions v-if="detailRow" :column="2" border size="medium">
        <el-descriptions-item label="登录账号">{{ detailRow.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ detailRow.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="showEnterpriseColumn" label="所属企业" :span="2">{{ detailRow.enterpriseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户角色">
          <el-tag size="small" type="info">{{ getEnumLabel(detailRow.roleType, roleTypeEnumMap) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="detailRow.status === 1 ? 'success' : 'danger'" size="small">
            {{ getEnumLabel(detailRow.status, statusEnumMap) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ detailRow.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">{{ detailRow.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailRow.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="头像" :span="2">
          <image-preview v-if="detailRow.avatar" :src="detailRow.avatar" width="60px" height="60px" />
          <span v-else class="text-muted">暂无</span>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageSysUser,
  getSysUserById,
  saveSysUser,
  updateSysUser,
  deleteSysUser,
  deleteBatchSysUser,
  listEnterpriseInfo
} from '@/api/sys_user'
import ImgUpload from '@/components/ImgUpload'
import ImagePreview from '@/components/ImagePreview'
import Pagination from '@/components/Pagination'

const ENTERPRISE_ROLES = [
  { value: 'enterprise_admin', label: '企业管理员' },
  { value: 'enterprise_operator', label: '企业运营人员' }
]

export default {
  name: 'SysUserManagePanel',
  components: {
    ImgUpload,
    ImagePreview,
    Pagination
  },
  props: {
    // platform_admin | enterprise_user | enterprise_self
    scope: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      ids: [],
      multiple: true,
      total: 0,
      sysUserList: [],
      title: '',
      open: false,
      detailOpen: false,
      detailRow: null,
      fixedEnterpriseId: null,
      queryParams: {
        current: 1,
        size: 10,
        username: null,
        realName: null,
        phone: null,
        roleType: null,
        status: null,
        enterpriseId: null
      },
      form: {},
      enterpriseInfoOptions: [],
      statusOptions: [{ value: 0, label: '禁用' }, { value: 1, label: '启用' }],
      statusEnumMap: { 0: '禁用', 1: '启用' }
    }
  },
  computed: {
    isPlatformAdminScope() {
      return this.scope === 'platform_admin'
    },
    isEnterpriseUserScope() {
      return this.scope === 'enterprise_user'
    },
    isEnterpriseSelfScope() {
      return this.scope === 'enterprise_self'
    },
    showEnterpriseFilter() {
      return this.isEnterpriseUserScope
    },
    showEnterpriseColumn() {
      return !this.isPlatformAdminScope
    },
    showEnterpriseForm() {
      return this.isEnterpriseUserScope
    },
    showRoleFilter() {
      return !this.isPlatformAdminScope
    },
    showRoleForm() {
      return !this.isPlatformAdminScope
    },
    roleTypeOptions() {
      return ENTERPRISE_ROLES
    },
    roleTypeEnumMap() {
      return {
        platform_admin: '平台管理员',
        enterprise_admin: '企业管理员',
        enterprise_operator: '企业运营人员'
      }
    },
    rules() {
      const passwordRule = this.form.id
        ? []
        : [{ required: true, message: '登录密码不能为空', trigger: 'blur' }]
      const rules = {
        username: [{ required: true, message: '登录账号不能为空', trigger: 'blur' }],
        password: passwordRule,
        realName: [{ required: true, message: '真实姓名不能为空', trigger: 'blur' }],
        phone: [{ required: true, message: '手机号码不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '账号状态不能为空', trigger: 'change' }]
      }
      if (this.showEnterpriseForm) {
        rules.enterpriseId = [{ required: true, message: '所属企业不能为空', trigger: 'change' }]
      }
      if (this.showRoleForm) {
        rules.roleType = [{ required: true, message: '用户角色不能为空', trigger: 'change' }]
      }
      return rules
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    async initPage() {
      if (this.isEnterpriseUserScope) {
        this.getEnterpriseInfoOptions()
      }
      if (this.isEnterpriseSelfScope) {
        await this.loadCurrentEnterprise()
      }
      this.getList()
    },
    loadCurrentEnterprise() {
      const userId = this.$store.getters.id
      if (!userId) {
        return Promise.resolve()
      }
      return getSysUserById(userId).then(response => {
        this.fixedEnterpriseId = response.data && response.data.enterpriseId
      })
    },
    buildQueryEntity() {
      const { current, size, ...rest } = this.queryParams
      const entity = { ...rest }
      if (this.isPlatformAdminScope) {
        entity.platformAdminOnly = true
        delete entity.enterpriseId
        delete entity.roleType
      }
      if (this.isEnterpriseUserScope) {
        entity.enterpriseUserOnly = true
      }
      if (this.isEnterpriseSelfScope) {
        entity.enterpriseUserOnly = true
        entity.enterpriseId = this.fixedEnterpriseId
        delete entity.enterpriseName
      }
      return entity
    },
    getList() {
      this.loading = true
      const { current, size } = this.queryParams
      pageSysUser(current, size, this.buildQueryEntity()).then(response => {
        const pageData = response.data
        this.sysUserList = pageData.records || []
        this.total = Number(pageData.total) || 0
      }).finally(() => {
        this.loading = false
      })
    },
    getEnterpriseInfoOptions() {
      listEnterpriseInfo({}).then(response => {
        this.enterpriseInfoOptions = response.data || []
      })
    },
    getEnumLabel(val, map) {
      if (map == null || map[val] === undefined) return val
      return map[val]
    },
    handleDetail(row) {
      getSysUserById(row.id).then(response => {
        this.detailRow = response.data
        this.detailOpen = true
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {}
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.current = 1
      this.queryParams.size = this.queryParams.size || 10
      this.queryParams.username = null
      this.queryParams.realName = null
      this.queryParams.phone = null
      this.queryParams.roleType = null
      this.queryParams.status = null
      this.queryParams.enterpriseId = null
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.form = {
        status: 1,
        roleType: this.isPlatformAdminScope ? 'platform_admin' : null,
        enterpriseId: this.isEnterpriseSelfScope ? this.fixedEnterpriseId : null
      }
      this.open = true
      this.title = this.isPlatformAdminScope ? '添加平台管理员' : '添加企业人员'
    },
    handleUpdate(row) {
      this.reset()
      getSysUserById(row.id).then(response => {
        this.form = { ...response.data, password: '' }
        this.open = true
        this.title = this.isPlatformAdminScope ? '修改平台管理员' : '修改企业人员'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = { ...this.form }
        if (this.isPlatformAdminScope) {
          payload.roleType = 'platform_admin'
          payload.enterpriseId = null
        }
        if (this.isEnterpriseSelfScope) {
          payload.enterpriseId = this.fixedEnterpriseId
        }
        if (payload.id && !payload.password) {
          delete payload.password
        }
        const request = payload.id ? updateSysUser(payload) : saveSysUser(payload)
        request.then(() => {
          this.$message.success(payload.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => deleteSysUser(ids)).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleDeleteBatch() {
      this.$confirm('是否确认删除选中的' + this.ids.length + '条数据？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => deleteBatchSysUser(this.ids)).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
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
.text-muted {
  color: #909399;
}
</style>
