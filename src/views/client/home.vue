<template>
  <div class="client-home">
    <section class="hero">
      <div class="hero-bg">
        <span class="orb orb-1" />
        <span class="orb orb-2" />
        <span class="orb orb-3" />
      </div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="badge">
            <i class="el-icon-magic-stick" />
            AI SaaS · 企业智能客服
          </div>
          <h1>
            让企业官网<br>
            <span class="highlight">立刻拥有 AI 客服能力</span>
          </h1>
          <p>注册企业账号，创建机器人，上传知识库，生成接入代码，一站式完成智能客服部署。</p>
          <div class="hero-actions">
            <el-button type="primary" size="medium" class="primary-btn" @click="$router.push('/user/register')">
              免费注册企业
              <i class="el-icon-arrow-right" />
            </el-button>
            <el-button size="medium" plain class="ghost-btn" @click="$router.push('/login')">进入管理后台</el-button>
          </div>
          <div class="hero-stats">
            <div v-for="stat in stats" :key="stat.label" class="stat-item">
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="chat-demo">
            <div class="chat-demo-header">
              <div class="avatar-wrap">
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="robot">
                <span class="online-dot" />
              </div>
              <div class="header-info">
                <span class="bot-name">智能客服小助手</span>
                <span class="bot-status">在线 · 即时响应</span>
              </div>
            </div>
            <div class="chat-demo-body">
              <div class="msg bot">
                <span class="msg-label">AI</span>
                您好，我是 AI 客服，请问有什么可以帮您？
              </div>
              <div class="msg user">如何接入网站？</div>
              <div class="msg bot">
                <span class="msg-label">AI</span>
                创建渠道后即可获取 JS / iframe 接入代码，3 分钟完成部署。
              </div>
              <div class="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
          <div class="visual-glow" />
        </div>
      </div>
    </section>

    <section class="features">
      <div class="section-head">
        <span class="section-tag">核心能力</span>
        <h2>全链路 AI 客服解决方案</h2>
        <p>从知识库构建到多渠道接入，覆盖企业客服完整业务场景</p>
      </div>
      <div class="features-grid">
        <div v-for="item in features" :key="item.title" class="feature-card">
          <div class="feature-icon"><i :class="item.icon" /></div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <section class="flow">
      <div class="section-head">
        <span class="section-tag">部署流程</span>
        <h2>业务闭环流程</h2>
        <p>八步完成从注册到持续优化，快速上线智能客服</p>
      </div>
      <div class="flow-track">
        <div v-for="(step, idx) in steps" :key="step" class="flow-step">
          <div class="step-marker">
            <span class="step-no">{{ idx + 1 }}</span>
            <span v-if="idx < steps.length - 1" class="step-line" />
          </div>
          <span class="step-text">{{ step }}</span>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="cta-inner">
        <div class="cta-text">
          <h2>准备好升级您的客服体验了吗？</h2>
          <p>立即注册，免费体验 AI 驱动的智能客服平台</p>
        </div>
        <el-button type="primary" size="medium" class="cta-btn" @click="$router.push('/user/register')">
          立即开始
        </el-button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ClientHome',
  data() {
    return {
      stats: [
        { value: '3 min', label: '快速接入' },
        { value: 'RAG', label: '知识库检索' },
        { value: '7×24', label: '全天候服务' }
      ],
      features: [
        { icon: 'el-icon-cpu', title: '多机器人管理', desc: '售前、售后、财务等场景独立配置 Prompt 与欢迎语。' },
        { icon: 'el-icon-notebook-2', title: '知识库 RAG', desc: '上传 PDF/Word/TXT 等资料，自动解析切片供 AI 检索。' },
        { icon: 'el-icon-link', title: '网站快速接入', desc: '支持 JS 嵌入、iframe 与独立聊天链接三种方式。' },
        { icon: 'el-icon-data-analysis', title: '数据统计洞察', desc: '访客、会话、热门问题与 RAG 命中率一目了然。' }
      ],
      steps: ['企业注册', '创建机器人', '上传知识库', '绑定机器人', '创建渠道', '接入官网', '访客咨询', '持续优化']
    }
  }
}
</script>

<style lang="scss" scoped>
// 企业 SaaS 配色（与后台管理端一致）
$primary: #0d9488;
$primary-dark: #0f766e;
$primary-deep: #134e4a;
$accent: #14b8a6;
$accent-light: #5eead4;
$accent-pale: #99f6e4;
$bg: #f8fafc;
$surface: #ffffff;
$text: #0f172a;
$text-secondary: #64748b;
$border: #e2e8f0;
$border-teal: #ccfbf1;
$shadow: rgba(20, 184, 166, 0.12);

.client-home {
  background: linear-gradient(180deg, #f0fdfa 0%, $bg 40%, $surface 100%);
  overflow: hidden;
}

.hero {
  position: relative;
  padding: 64px 20px 72px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 480px;
  height: 480px;
  top: -120px;
  left: -80px;
  background: radial-gradient(circle, rgba($accent-light, 0.5), transparent 70%);
}

.orb-2 {
  width: 360px;
  height: 360px;
  top: 40px;
  right: -60px;
  background: radial-gradient(circle, rgba($accent-pale, 0.4), transparent 70%);
}

.orb-3 {
  width: 240px;
  height: 240px;
  bottom: -40px;
  left: 40%;
  background: radial-gradient(circle, rgba($primary, 0.2), transparent 70%);
}

.hero-inner {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: #ecfdf5;
  border: 1px solid $border-teal;
  color: $primary-dark;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  margin-bottom: 20px;
}

.hero-content h1 {
  margin: 0 0 18px;
  font-size: 44px;
  line-height: 1.25;
  font-weight: 700;
  color: $primary-deep;
  letter-spacing: -0.5px;
}

.highlight {
  background: linear-gradient(135deg, $primary 0%, $accent 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  margin: 0 0 28px;
  color: $text-secondary;
  line-height: 1.85;
  max-width: 480px;
  font-size: 15px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn {
  border: none;
  background: linear-gradient(90deg, $accent-light, $accent);
  color: $primary-deep;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 16px $shadow;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  i { margin-left: 4px; }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(20, 184, 166, 0.22);
    background: linear-gradient(90deg, $accent-light, $accent);
    color: $primary-deep;
  }
}

.ghost-btn {
  border-color: $accent-pale;
  color: $primary-dark;
  border-radius: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.25s ease;

  &:hover {
    background: #ecfdf5;
    border-color: $accent-light;
    color: $primary-dark;
  }
}

.hero-stats {
  display: flex;
  gap: 32px;
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid $border;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 20px;
    font-weight: 700;
    color: $primary-deep;
    letter-spacing: -0.3px;
  }

  span {
    font-size: 12px;
    color: $text-secondary;
  }
}

.hero-visual {
  position: relative;
}

.visual-glow {
  position: absolute;
  inset: 10% 5%;
  background: radial-gradient(ellipse, rgba($accent-light, 0.2), transparent 65%);
  pointer-events: none;
  z-index: 0;
}

.chat-demo {
  position: relative;
  z-index: 1;
  background: $surface;
  border-radius: 16px;
  box-shadow: 0 24px 60px $shadow, 0 0 0 1px $border-teal;
  overflow: hidden;
}

.chat-demo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(90deg, $accent-light, $accent);
  color: $primary-deep;

  .bot-name { color: $primary-deep; }
}

.avatar-wrap {
  position: relative;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.2);
  }
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid #fff;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bot-name {
  font-weight: 600;
  font-size: 14px;
}

.bot-status {
  font-size: 11px;
  opacity: 0.75;
}

.chat-demo-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.msg {
  max-width: 88%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.65;
}

.msg.bot {
  align-self: flex-start;
  background: #f1f5f9;
  color: #334155;
  border-bottom-left-radius: 4px;
}

.msg-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: $primary;
  margin-right: 6px;
  letter-spacing: 0.5px;
}

.msg.user {
  align-self: flex-end;
  background: #ecfdf5;
  color: $primary-deep;
  border-bottom-right-radius: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-self: flex-start;
  padding: 10px 14px;
  background: #f1f5f9;
  border-radius: 14px;
  border-bottom-left-radius: 4px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $accent;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.section-head {
  text-align: center;
  margin-bottom: 40px;

  h2 {
    margin: 10px 0 10px;
    font-size: 28px;
    font-weight: 700;
    color: $primary-deep;
    letter-spacing: -0.3px;
  }

  p {
    margin: 0;
    color: $text-secondary;
    font-size: 14px;
  }
}

.section-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  color: $primary-dark;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 28px 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, $accent-light, $accent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(15, 118, 110, 0.08);
    border-color: $border-teal;

    &::before { opacity: 1; }
  }

  h3 {
    margin: 16px 0 10px;
    color: $primary-deep;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: $text-secondary;
    font-size: 13px;
    line-height: 1.75;
  }
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #ecfdf5;
  color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.flow {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 20px;
}

.flow-track {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.step-marker {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.step-no {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent-light, $accent);
  color: $primary-deep;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 12px $shadow;
  flex-shrink: 0;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.step-line {
  position: absolute;
  top: 50%;
  left: calc(50% + 22px);
  right: calc(-50% + 22px);
  height: 2px;
  background: linear-gradient(90deg, $accent-pale, $accent-light);
  transform: translateY(-50%);
}

.step-text {
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.cta {
  max-width: 1200px;
  margin: 0 auto 56px;
  padding: 0 20px;
}

.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 40px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #ffffff 100%);
  border: 1px solid $border-teal;
  box-shadow: 0 8px 32px rgba(20, 184, 166, 0.08);
}

.cta-text {
  h2 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    color: $primary-deep;
  }

  p {
    margin: 0;
    color: $text-secondary;
    font-size: 14px;
  }
}

.cta-btn {
  flex-shrink: 0;
  border: none;
  background: linear-gradient(90deg, $accent-light, $accent);
  color: $primary-deep;
  border-radius: 8px;
  padding: 12px 32px;
  font-weight: 600;
  box-shadow: 0 4px 16px $shadow;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(20, 184, 166, 0.22);
    background: linear-gradient(90deg, $accent-light, $accent);
    color: $primary-deep;
  }
}

@media (max-width: 960px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero-content h1 { font-size: 34px; }

  .features-grid,
  .flow-track { grid-template-columns: repeat(2, 1fr); }

  .step-line { display: none; }

  .cta-inner {
    flex-direction: column;
    text-align: center;
    padding: 32px 28px;
  }
}

@media (max-width: 560px) {
  .hero { padding: 40px 16px 48px; }
  .hero-content h1 { font-size: 28px; }
  .hero-stats { gap: 20px; }
  .features-grid,
  .flow-track { grid-template-columns: 1fr; }
}
</style>
