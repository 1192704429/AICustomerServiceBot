<template>
  <div class="register-page">
    <div class="register-shell">
      <aside class="brand-panel">
        <div class="brand-badge">Enterprise SaaS</div>
        <h1>企业智能客服平台</h1>
        <p>提交企业资料并完成平台审核后，即可登录管理后台，部署 AI 客服能力。</p>
        <ul class="brand-list">
          <li v-for="item in highlights" :key="item">
            <i class="el-icon-circle-check" /> {{ item }}
          </li>
        </ul>
        <div class="audit-tip">
          <i class="el-icon-info" />
          <span>注册后进入人工审核，通常 1–2 个工作日完成</span>
        </div>
      </aside>

      <section class="form-panel">
        <div class="form-header">
          <h2>企业注册申请</h2>
          <p>请如实填写以下信息，带 <em>*</em> 为必填项</p>
        </div>

        <div class="form-body">
          <el-steps :active="step" align-center finish-status="success" class="register-steps" simple>
            <el-step title="企业信息" />
            <el-step title="联系人" />
            <el-step title="管理员账号" />
          </el-steps>

          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="register-form">
            <!-- Step 1 -->
            <div v-show="step === 0" class="step-block">
              <el-row :gutter="12">
                <el-col :span="24">
                  <el-form-item label="企业名称" prop="enterpriseName">
                    <el-input v-model="form.enterpriseName" prefix-icon="el-icon-office-building" placeholder="请输入企业全称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所属行业" prop="industryName">
                    <el-select v-model="form.industryName" placeholder="请选择行业" style="width: 100%;">
                      <el-option v-for="item in industryOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="企业地址" prop="enterpriseAddress">
                    <el-input v-model="form.enterpriseAddress" prefix-icon="el-icon-location-outline" placeholder="省市区 + 详细地址" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="企业简介" prop="enterpriseDesc">
                    <el-input
                      v-model="form.enterpriseDesc"
                      type="textarea"
                      :rows="3"
                      maxlength="300"
                      show-word-limit
                      placeholder="简要介绍企业业务与客服场景（选填）"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="营业执照" prop="businessLicense" class="license-item">
                    <img-upload v-model="form.businessLicense" :limit="1" :is-show-tip="false" />
                    <span class="field-tip">支持 JPG/PNG，用于平台审核（选填）</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Step 2 -->
            <div v-show="step === 1" class="step-block">
              <el-row :gutter="12">
                <el-col :span="12">
                  <el-form-item label="联系人姓名" prop="contactName">
                    <el-input v-model="form.contactName" prefix-icon="el-icon-user" placeholder="请输入联系人姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="form.contactPhone" prefix-icon="el-icon-phone" placeholder="请输入手机号" maxlength="11" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="联系邮箱" prop="contactEmail">
                    <el-input v-model="form.contactEmail" prefix-icon="el-icon-message" placeholder="用于接收审核通知" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Step 3 -->
            <div v-show="step === 2" class="step-block">
              <el-alert
                title="管理员账号将用于登录管理后台，审核通过后即可使用"
                type="info"
                :closable="false"
                show-icon
                class="account-alert"
              />
              <el-row :gutter="12">
                <el-col :span="24">
                  <el-form-item label="管理员登录账号" prop="username">
                    <el-input v-model="form.username" prefix-icon="el-icon-s-custom" placeholder="建议使用字母+数字，4-20位" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="登录密码" prop="password">
                    <el-input v-model="form.password" prefix-icon="el-icon-lock" type="password" placeholder="至少6位" show-password />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="form.confirmPassword" prefix-icon="el-icon-lock" type="password" placeholder="再次输入密码" show-password />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </div>

        <div class="form-actions">
          <el-button v-if="step > 0" @click="prevStep">上一步</el-button>
          <el-button v-if="step < 2" type="primary" class="next-btn" @click="nextStep">下一步</el-button>
          <el-button v-else type="primary" class="submit-btn" :loading="loading" @click="handleRegister">提交注册申请</el-button>
        </div>

        <div class="switch-entry">
          <el-link type="primary" @click="$router.push('/login')">已有账号，去登录</el-link>
          <el-link type="primary" @click="$router.push('/user/home')">返回首页</el-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import ImgUpload from '@/components/ImgUpload'

const PHONE_REG = /^1[3-9]\d{9}$/
const EMAIL_REG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
  name: 'ClientRegister',
  components: { ImgUpload },
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.form.password) callback(new Error('两次输入的密码不一致'))
      else callback()
    }
    const validatePhone = (rule, value, callback) => {
      if (!value) return callback(new Error('请输入联系电话'))
      if (!PHONE_REG.test(value)) return callback(new Error('请输入正确的手机号'))
      callback()
    }
    const validateEmail = (rule, value, callback) => {
      if (!value) return callback(new Error('请输入联系邮箱'))
      if (!EMAIL_REG.test(value)) return callback(new Error('邮箱格式不正确'))
      callback()
    }
    return {
      step: 0,
      loading: false,
      highlights: ['多租户 SaaS 架构', '知识库 RAG 检索', '网站一键接入'],
      industryOptions: ['互联网/软件', '电商/零售', '金融/保险', '教育/培训', '医疗/健康', '制造业', '房地产', '其他'],
      form: {
        enterpriseName: '',
        industryName: '',
        enterpriseAddress: '',
        enterpriseDesc: '',
        businessLicense: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        enterpriseName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
        industryName: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
        enterpriseAddress: [{ required: true, message: '请输入企业地址', trigger: 'blur' }],
        contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: [{ validator: validatePhone, trigger: 'blur' }],
        contactEmail: [{ validator: validateEmail, trigger: 'blur' }],
        username: [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 4, max: 20, message: '账号长度 4-20 位', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' }],
        confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
      }
    }
  },
  computed: {
    stepFields() {
      return [
        ['enterpriseName', 'industryName', 'enterpriseAddress'],
        ['contactName', 'contactPhone', 'contactEmail'],
        ['username', 'password', 'confirmPassword']
      ]
    }
  },
  methods: {
    validateStepFields(fields) {
      return new Promise(resolve => {
        let valid = true
        let done = 0
        if (!fields.length) return resolve(true)
        fields.forEach(field => {
          this.$refs.formRef.validateField(field, err => {
            if (err) valid = false
            done += 1
            if (done === fields.length) resolve(valid)
          })
        })
      })
    },
    async nextStep() {
      const ok = await this.validateStepFields(this.stepFields[this.step])
      if (ok) this.step += 1
    },
    prevStep() {
      if (this.step > 0) this.step -= 1
    },
    handleRegister() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          const { confirmPassword, ...registerData } = this.form
          await this.$store.dispatch('clientUser/register', registerData)
          this.$alert(
            '您的企业注册申请已提交，平台将在审核通过后开放登录。审核结果将通过联系邮箱通知，请耐心等待。',
            '提交成功',
            {
              confirmButtonText: '前往登录',
              type: 'success',
              callback: () => this.$router.push('/login')
            }
          )
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #0d9488;
$primary-dark: #0f766e;
$primary-deep: #134e4a;
$accent: #14b8a6;
$accent-light: #5eead4;
$text-secondary: #64748b;
$border-teal: #ccfbf1;

.register-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  box-sizing: border-box;
  background: linear-gradient(160deg, #ecfdf5 0%, #f8fafc 55%, #ffffff 100%);
}

.register-shell {
  width: 100%;
  max-width: 1020px;
  max-height: calc(100vh - 48px);
  display: grid;
  grid-template-columns: 300px 1fr;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 22px 52px rgba(20, 184, 166, 0.11);
  border: 1px solid $border-teal;
  background: #fff;
}

.brand-panel {
  padding: 32px 28px;
  background: linear-gradient(165deg, #0f766e 0%, #0d9488 45%, #14b8a6 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;

  h1 {
    margin: 0 0 12px;
    font-size: 24px;
    line-height: 1.35;
  }

  p {
    margin: 0 0 22px;
    font-size: 14px;
    line-height: 1.7;
    opacity: 0.9;
  }
}

.brand-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.brand-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 14px;
    opacity: 0.95;

    i { font-size: 15px; }
  }
}

.audit-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 24px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  line-height: 1.55;
  opacity: 0.9;

  i { margin-top: 2px; flex-shrink: 0; }
}

.form-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: calc(100vh - 48px);
  padding: 28px 32px 20px;
}

.form-header {
  flex-shrink: 0;
  margin-bottom: 18px;

  h2 {
    margin: 0 0 6px;
    font-size: 21px;
    color: $primary-deep;
  }

  p {
    margin: 0;
    color: $text-secondary;
    font-size: 13px;

    em {
      color: #ef4444;
      font-style: normal;
    }
  }
}

.form-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.register-steps {
  margin-bottom: 22px;

  ::v-deep .el-step__title {
    font-size: 13px;
  }

  ::v-deep .el-step__head.is-process {
    color: $primary;
    border-color: $primary;
  }

  ::v-deep .el-step__head.is-success {
    color: $accent;
    border-color: $accent;
  }
}

.register-form {
  ::v-deep .el-form-item {
    margin-bottom: 16px;
  }

  ::v-deep .el-form-item__label {
    padding-bottom: 4px;
    line-height: 1.4;
    color: #334155;
    font-weight: 500;
    font-size: 14px;
  }

  ::v-deep .el-input__inner {
    height: 38px;
    line-height: 38px;
  }
}

.step-block {
  min-height: 0;
}

.license-item {
  ::v-deep .el-upload--picture-card {
    width: 100px;
    height: 100px;
    line-height: 98px;
  }

  ::v-deep .el-upload-list--picture-card .el-upload-list__item {
    width: 100px;
    height: 100px;
  }
}

.field-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #94a3b8;
  vertical-align: middle;
}

.account-alert {
  margin-bottom: 16px;
  border-radius: 8px;

  ::v-deep .el-alert__title {
    font-size: 13px;
  }
}

.form-actions {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.next-btn,
.submit-btn {
  border: none;
  background: linear-gradient(90deg, $accent-light, $accent);
  color: $primary-deep;
  font-weight: 600;
  padding: 10px 26px;

  &:hover {
    background: linear-gradient(90deg, $accent-light, $accent);
    color: $primary-deep;
  }
}

.switch-entry {
  flex-shrink: 0;
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
}

@media (max-width: 900px) {
  .register-page {
    height: auto;
    min-height: 100vh;
    overflow: auto;
    padding: 12px;
  }

  .register-shell {
    grid-template-columns: 1fr;
    max-height: none;
  }

  .brand-panel {
    padding: 20px;
  }

  .form-panel {
    max-height: none;
    padding: 20px 16px 16px;
  }

  .form-body {
    overflow: visible;
  }
}
</style>
