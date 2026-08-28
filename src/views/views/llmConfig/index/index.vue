<template>
  <div v-loading="loading" class="app-container llm-config-page">
    <div class="page-header">
      <div class="page-header__main">
        <div>
          <h2>大模型配置</h2>
          <p>配置企业使用的大模型，同一时间只能启用一个。</p>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          添加配置
        </el-button>
      </div>
    </div>

    <el-empty
      v-if="!loading && !configList.length"
      description="暂无大模型配置，点击上方按钮添加"
    />

    <div v-else class="config-grid">
      <div
        v-for="item in configList"
        :key="item.id"
        class="config-card"
        :class="{ 'is-active': item.status === 1 }"
      >
        <div class="config-card__head">
          <strong>{{ item.configName || '未命名配置' }}</strong>
          <el-tag v-if="item.status === 1" size="mini" type="success">已启用</el-tag>
        </div>

        <div class="config-card__body">
          <p><span>模型名称</span>{{ item.modelName || '-' }}</p>
          <p><span>API 地址</span>{{ item.apiUrl || '-' }}</p>
          <p v-if="item.remark"><span>备注</span>{{ item.remark }}</p>
        </div>

        <div class="config-card__footer">
          <el-button type="text" @click="handleUpdate(item)">修改</el-button>
          <el-button
            v-if="item.status !== 1"
            type="text"
            :loading="item.enabling"
            @click="handleEnable(item)"
          >
            启用
          </el-button>
          <el-button
            type="text"
            style="color: #f56c6c;"
            @click="handleDelete(item)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="open"
      width="560px"
      append-to-body
      @closed="resetForm"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="API 地址" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入 API 地址" />
        </el-form-item>
        <el-form-item label="API 密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="请输入 API 密钥"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="可选备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">取 消</el-button>
        <el-button :loading="submitting" @click="submitForm(false)">保 存</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm(true)">
          保存并启用
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo } from '@/api/user'
import {
  listLlmConfig,
  saveLlmConfig,
  updateLlmConfig,
  enableLlmConfig,
  deleteLlmConfig
} from '@/api/llm_config'

const DEFAULT_PROVIDER_TYPE = 5

function emptyForm() {
  return {
    id: null,
    configName: '',
    modelName: '',
    apiUrl: '',
    apiKey: '',
    remark: '',
    status: 0
  }
}

export default {
  name: 'LlmConfig',
  data() {
    return {
      loading: false,
      submitting: false,
      enterpriseId: null,
      configList: [],
      open: false,
      form: emptyForm(),
      rules: {
        configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
        modelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
        apiUrl: [{ required: true, message: 'API 地址不能为空', trigger: 'blur' }],
        apiKey: [{ required: true, message: 'API 密钥不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['id']),
    dialogTitle() {
      return this.form.id ? '修改大模型配置' : '添加大模型配置'
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const userRes = await getUserInfo(this.id)
        this.enterpriseId = userRes.data && userRes.data.enterpriseId
        if (!this.enterpriseId) {
          this.$message.warning('当前账号未关联企业')
          this.configList = []
          return
        }

        const listRes = await listLlmConfig({})
        this.configList = (listRes.data || []).map(item => ({
          ...item,
          enabling: false
        }))
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.form = emptyForm()
      this.open = true
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    handleUpdate(row) {
      this.form = {
        id: row.id,
        configName: row.configName,
        modelName: row.modelName,
        apiUrl: row.apiUrl,
        apiKey: row.apiKey,
        remark: row.remark,
        status: row.status
      }
      this.open = true
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    resetForm() {
      this.form = emptyForm()
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    buildPayload(enable) {
      return {
        id: this.form.id,
        providerType: DEFAULT_PROVIDER_TYPE,
        configName: this.form.configName,
        modelName: this.form.modelName,
        apiUrl: this.form.apiUrl,
        apiKey: this.form.apiKey,
        remark: this.form.remark,
        status: enable ? 1 : (this.form.status === 1 ? 1 : 0)
      }
    },
    submitForm(enable) {
      this.$refs.form.validate(async valid => {
        if (!valid) return

        this.submitting = true
        try {
          const payload = this.buildPayload(enable)
          if (this.form.id) {
            await updateLlmConfig(payload)
          } else {
            await saveLlmConfig(payload)
          }
          this.$message.success(enable ? '已保存并启用' : '保存成功')
          this.open = false
          await this.loadData()
        } finally {
          this.submitting = false
        }
      })
    },
    async handleEnable(item) {
      item.enabling = true
      try {
        await enableLlmConfig(item.id)
        this.$message.success('已启用')
        await this.loadData()
      } finally {
        item.enabling = false
      }
    },
    handleDelete(item) {
      this.$confirm('确认删除该配置吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        await deleteLlmConfig(item.id)
        this.$message.success('删除成功')
        await this.loadData()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.llm-config-page {
  .page-header {
    margin-bottom: 24px;

    &__main {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

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

  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .config-card {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 10px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &.is-active {
      border-color: #409eff;
      background: #f5f9ff;
      box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.15);
    }

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;

      strong {
        font-size: 16px;
        color: #303133;
      }
    }

    &__body {
      flex: 1;

      p {
        margin: 0 0 10px;
        font-size: 14px;
        color: #606266;
        line-height: 1.5;
        word-break: break-all;

        span {
          display: inline-block;
          width: 72px;
          color: #909399;
        }
      }
    }

    &__footer {
      display: flex;
      gap: 8px;
      padding-top: 12px;
      margin-top: 4px;
      border-top: 1px solid #f2f3f5;
    }
  }
}
</style>
