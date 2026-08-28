<template>
  <div class="login-page">
    <div class="login-shell">
      <section class="brand-panel">
        <h1 class="brand-title">欢迎使用
企业智能客服机器人平台</h1>
        <p class="brand-desc">智能客服 · 全流程管理平台</p>
        <ul class="feature-list">
          <li><i class="el-icon-data-analysis" /> 智能会话管理</li>
          <li><i class="el-icon-s-check" /> 多租户权限管控</li>
          <li><i class="el-icon-connection" /> 客服数据洞察</li>
        </ul>
        <div class="deco-ring ring-1" />
        <div class="deco-ring ring-2" />
      </section>

      <section class="form-panel">
        <div class="form-head">
          <h2 class="form-title">系统登录</h2>
          <p class="form-subtitle">欢迎回来，请填写登录信息</p>
        </div>

        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter.native="handleLogin"
        >
         <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              prefix-icon="el-icon-user"
              placeholder="请输入用户名"
              size="medium"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              prefix-icon="el-icon-lock"
              type="password"
              placeholder="请输入密码"
              show-password
              size="medium"
            />
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.captcha"
                prefix-icon="el-icon-picture-outline"
                placeholder="验证码"
                size="medium"
                class="captcha-input"
              />
              <div class="captcha-box" @click="refreshCaptcha">
                <img v-if="captchaImageUrl" :src="captchaImageUrl" alt="验证码">
                <span v-else class="captcha-tip">点击获取</span>
              </div>
            </div>
          </el-form-item>

          <div class="form-extra">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="javascript:void(0)" class="link-muted">忘记密码？</a>
          </div>

          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            进入系统
          </el-button>
        </el-form>

        <div class="form-footer">
          <router-link to="/user/register" class="footer-link">企业注册</router-link>
          <router-link to="/user/home" class="footer-link">返回首页</router-link>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import { getCaptcha } from '@/api/user'

export default {
  name: 'Login5',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) callback(new Error('请输入用户名'))
      else callback()
    }
    const validatePassword = (rule, value, callback) => {
      if (!value) callback(new Error('请输入密码'))
      else if (value.length < 6) callback(new Error('密码长度不能少于6位'))
      else callback()
    }
    const validateCaptcha = (rule, value, callback) => {
      if (!value) callback(new Error('请输入验证码'))
      else callback()
    }
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: '',
        captchaKey: ''
      },
      loginRules: {
        username: [{ validator: validateUsername, trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        captcha: [{ validator: validateCaptcha, trigger: 'blur' }]
      },
      rememberMe: false,
      loading: false,
      captchaImageUrl: ''
    }
  },
  mounted() {
    this.refreshCaptcha()
  },
  beforeDestroy() {
    if (this.captchaImageUrl) {
      window.URL.revokeObjectURL(this.captchaImageUrl)
    }
  },
  methods: {
    refreshCaptcha() {
      const cacheKey = Date.now().toString()
      this.loginForm.captchaKey = cacheKey
      if (this.captchaImageUrl) {
        window.URL.revokeObjectURL(this.captchaImageUrl)
      }
      getCaptcha(cacheKey).then(blob => {
        this.captchaImageUrl = window.URL.createObjectURL(blob)
      }).catch(error => {
        console.error('获取验证码失败:', error)
        this.$message.error('获取验证码失败，请重试')
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return false
        this.loading = true
        this.$store.dispatch('user/login', this.loginForm).then(() => {
          const redirect = this.$route.query.redirect
          this.$router.push(redirect || '/index')
        }).catch(() => {
          this.refreshCaptcha()
          this.loginForm.captcha = ''
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(160deg, #ecfdf5 0%, #f0fdfa 50%, #f8fafc 100%);
}

.login-shell {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(20, 184, 166, 0.1);
  border: 1px solid #ccfbf1;
}

.brand-panel {
  flex: 1;
  position: relative;
  padding: 40px 36px;
  background: linear-gradient(160deg, #99f6e4 0%, #5eead4 55%, #a7f3d0 100%);
  color: #115e59;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .brand-title {
    margin: 0 0 10px;
    font-size: 30px;
    line-height: 1.35;
    font-weight: 700;
    color: #134e4a;
  }

  .brand-desc {
    margin: 0 0 28px;
    font-size: 13px;
    color: #0f766e;
    opacity: 0.85;
  }

  .feature-list {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 13px;
      color: #115e59;

      i {
        font-size: 16px;
        color: #0d9488;
      }
    }
  }

  .deco-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }

  .ring-1 {
    width: 220px;
    height: 220px;
    right: -60px;
    bottom: -40px;
  }

  .ring-2 {
    width: 120px;
    height: 120px;
    right: 40px;
    bottom: 80px;
    background: rgba(255, 255, 255, 0.35);
  }
}

.form-panel {
  width: 400px;
  flex-shrink: 0;
  padding: 40px 36px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-head {
  margin-bottom: 22px;

  .form-title {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 600;
    color: #134e4a;
  }

  .form-subtitle {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
  }
}

.login-form {
  ::v-deep .el-input__inner {
    height: 42px;
    line-height: 42px;
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #334155;
    border-radius: 10px;
    transition: all 0.2s ease;

    &::placeholder {
      color: #94a3b8;
    }

    &:focus {
      border-color: #2dd4bf;
      box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15);
      background: #fff;
    }
  }

  ::v-deep .el-input__prefix {
    color: #94a3b8;
  }

  ::v-deep .el-checkbox__label {
    color: #64748b;
    font-size: 13px;
  }
}

.captcha-row {
  display: flex;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-box {
  width: 108px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #f8fafc;
  transition: border-color 0.2s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .captcha-tip {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #94a3b8;
  }

  &:hover {
    border-color: #2dd4bf;
  }
}

.form-extra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 20px;

  .link-muted {
    font-size: 13px;
    color: #64748b;
    text-decoration: none;

    &:hover {
      color: #0d9488;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #5eead4 0%, #2dd4bf 100%);
  box-shadow: 0 4px 14px rgba(45, 212, 191, 0.22);
  color: #115e59;
  transition: all 0.2s ease;

  &:hover,
  &:focus {
    background: linear-gradient(90deg, #2dd4bf 0%, #14b8a6 100%);
    color: #fff;
    box-shadow: 0 6px 18px rgba(45, 212, 191, 0.3);
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.footer-link {
  font-size: 13px;
  color: #64748b;
  text-decoration: none;

  &:hover {
    color: #0d9488;
  }
}

@media (max-width: 860px) {
  .login-shell {
    flex-direction: column;
    min-height: auto;
  }

  .form-panel {
    width: 100%;
  }
}
</style>
