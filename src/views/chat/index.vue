<template>
  <div class="chat-page">
    <div class="chat-shell">
      <header class="chat-header">
        <img :src="channel.robotAvatar || defaultAvatar" alt="avatar" class="avatar">
        <div class="header-info">
          <h3>{{ channel.robotName || '智能客服' }}</h3>
          <p>{{ channel.channelName || '在线客服' }}</p>
        </div>
        <span class="status-dot" :class="wsStatus">{{ statusLabel }}</span>
      </header>

      <div ref="messageBox" class="chat-body" @scroll="onMessageScroll">
        <div v-if="channel.welcomeMessage" class="message bot">
          <img :src="channel.robotAvatar || defaultAvatar" alt="" class="msg-avatar">
          <div class="bubble">
            <ChatMessageContent :content="channel.welcomeMessage" variant="bot" />
          </div>
        </div>

        <div v-for="(msg, idx) in messages" :key="msg.id || ('msg-' + idx)" :class="['message', messageClass(msg.role)]">
          <img
            v-if="msg.role !== 'system' && msg.role !== 'user'"
            :src="msg.role === 'agent' ? defaultAgentAvatar : (channel.robotAvatar || defaultAvatar)"
            alt=""
            class="msg-avatar"
          >
          <div v-if="msg.role === 'system'" class="system-tip">{{ msg.content }}</div>
          <div v-else class="bubble">
            <ChatMessageContent :content="msg.content" :variant="msg.role === 'user' ? 'user' : (msg.role === 'agent' ? 'agent' : 'bot')" />
          </div>
        </div>
        <div v-if="streaming" class="message bot">
          <img :src="channel.robotAvatar || defaultAvatar" alt="" class="msg-avatar">
          <div class="bubble typing">
            <ChatMessageContent v-if="streamBuffer" :content="streamBuffer" variant="bot" />
            <span v-else class="typing-dots"><i /><i /><i /></span>
          </div>
        </div>
        <div ref="scrollAnchor" class="scroll-anchor" aria-hidden="true" />
      </div>

      <footer class="chat-footer">
        <div v-if="showRecommendQuestions" class="recommend-bar">
          <p class="recommend-title">猜你想问</p>
          <div class="recommend-list">
            <button
              v-for="(item, idx) in recommendQuestions"
              :key="idx"
              class="recommend-chip"
              :disabled="sending"
              @click="sendQuestion(item)"
            >{{ item }}</button>
          </div>
        </div>
        <div class="chat-footer__input-row">
          <div class="input-wrap">
            <el-input
              v-model="inputText"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              resize="none"
              :placeholder="inputPlaceholder"
              :disabled="sending"
              @keyup.enter.native.exact="sendQuestion(inputText)"
            />
          </div>
          <el-button
            type="primary"
            class="send-btn"
            :loading="sending"
            :disabled="!inputText.trim() && !sending"
            @click="sendQuestion(inputText)"
          >
            <span class="send-btn-text">发送</span>
          </el-button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { getChannelInfo, createChatSession, sendChatMessage, resumeChatSession } from '@/api/chat'
import { loadChatStorage, saveChatStorage, clearSessionStorage } from '@/utils/chat-storage'
import ChatMessageContent from '@/components/ChatMessageContent'

export default {
  name: 'PublicChat',
  components: { ChatMessageContent },
  data() {
    return {
      channelId: null,
      channel: {},
      messages: [],
      recommendQuestions: [],
      inputText: '',
      visitorId: null,
      sessionId: null,
      ws: null,
      wsStatus: 'connecting', // connecting | connected | disconnected
      sessionEnded: false,
      sending: false,
      streaming: false,
      streamBuffer: '',
      intentionalClose: false,
      initializing: true,
      userScrolledUp: false,
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      defaultAgentAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
  },
  watch: {
    messages: {
      handler() {
        if (!this.userScrolledUp) this.scrollBottom()
      },
      deep: true
    },
    streaming(val) {
      if (val && !this.userScrolledUp) this.scrollBottom()
    },
    streamBuffer() {
      if (this.streaming && !this.userScrolledUp) this.scrollBottom()
    }
  },
  computed: {
    statusLabel() {
      if (this.sessionEnded) return '已断开'
      if (this.wsStatus === 'connected') return '在线'
      if (this.wsStatus === 'connecting') return '连接中'
      return '已断开'
    },
    inputPlaceholder() {
      if (this.sessionEnded || this.wsStatus === 'disconnected') {
        return '连接已断开，发送消息将开启新会话...'
      }
      return '请输入您的问题...'
    },
    showRecommendQuestions() {
      return this.recommendQuestions.length > 0
    }
  },
  created() {
    this.channelId = this.$route.query.channelId
    if (!this.channelId) {
      this.$message.error('缺少 channelId 参数')
      return
    }
    this.bootstrap()
  },
  beforeDestroy() {
    this.teardownWebSocket()
  },
  methods: {
    async bootstrap() {
      try {
        await this.loadChannel()
        await this.initChat()
        await this.connectWebSocket()
      } finally {
        this.initializing = false
      }
    },
    loadChannel() {
      return getChannelInfo(this.channelId).then(res => {
        this.channel = res.data || {}
        this.applyRecommendQuestions(this.channel.recommendQuestions)
      })
    },
    applyRecommendQuestions(list) {
      this.recommendQuestions = Array.isArray(list) ? list.filter(Boolean) : []
    },
    async initChat() {
      const stored = loadChatStorage(this.channelId)
      this.visitorId = stored.visitorId || null

      const res = await resumeChatSession({
        channelId: Number(this.channelId),
        visitorId: this.visitorId,
        visitorName: '网站访客'
      })
      const data = res.data || {}
      this.visitorId = data.visitorId
      this.sessionEnded = !!data.sessionEnded
      if (data.recommendQuestions) {
        this.applyRecommendQuestions(data.recommendQuestions)
      }

      if (data.session && data.session.id) {
        this.sessionId = data.session.id
      } else {
        this.sessionId = null
      }

      this.messages = this.mapHistoryMessages(data.history || [])
      this.persistSession()

      if (this.sessionEnded) {
        this.wsStatus = 'disconnected'
        this.messages.push({
          role: 'system',
          content: '上次会话已结束，发送消息将开启新会话'
        })
        this.sessionId = null
        clearSessionStorage(this.channelId)
      }

      this.scrollBottom()
    },
    mapHistoryMessages(history) {
      return (history || []).map(item => ({
        id: item.id,
        role: item.role || 'bot',
        content: item.content || ''
      }))
    },
    persistSession() {
      saveChatStorage(this.channelId, {
        visitorId: this.visitorId,
        sessionId: this.sessionId
      })
    },
    messageClass(role) {
      if (role === 'user') return 'user'
      if (role === 'agent') return 'agent'
      if (role === 'system') return 'system'
      return 'bot'
    },
    isWsOpen() {
      return this.ws && this.ws.readyState === WebSocket.OPEN
    },
    teardownWebSocket() {
      if (!this.ws) return
      this.intentionalClose = true
      try {
        this.ws.onopen = null
        this.ws.onmessage = null
        this.ws.onerror = null
        this.ws.onclose = null
        this.ws.close()
      } catch (e) {
        // ignore
      }
      this.ws = null
    },
    connectWebSocket() {
      this.teardownWebSocket()
      this.intentionalClose = false
      this.wsStatus = 'connecting'

      const base = process.env.VUE_APP_BASE_API || 'http://localhost:8088'
      const wsBase = base.replace(/^http/, 'ws')
      const socket = new WebSocket(`${wsBase}/ws/chat?channelId=${this.channelId}`)
      this.ws = socket

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('WebSocket 连接超时'))
        }, 8000)

        socket.onopen = () => {
          clearTimeout(timer)
          if (this.ws !== socket) return
          this.wsStatus = 'connected'
          resolve()
        }
        socket.onmessage = (event) => {
          if (this.ws !== socket) return
          try {
            const data = JSON.parse(event.data)
            this.handleSocketMessage(data)
          } catch (e) {
            // ignore bad payload
          }
        }
        socket.onerror = () => {
          clearTimeout(timer)
          if (this.ws !== socket) return
          reject(new Error('WebSocket 连接失败'))
        }
        socket.onclose = () => {
          clearTimeout(timer)
          if (this.ws !== socket) return
          this.ws = null
          if (this.intentionalClose) return
          // session_end 已处理过则只同步状态，避免重复提示
          if (this.sessionEnded) {
            this.wsStatus = 'disconnected'
            this.sending = false
            this.streaming = false
          } else {
            this.markDisconnected('连接已断开，发送消息将开启新会话')
          }
          reject(new Error('WebSocket 已关闭'))
        }
      }).catch(() => {
        if (this.wsStatus !== 'connected') {
          this.wsStatus = 'disconnected'
        }
      })
    },
    markDisconnected(tip) {
      this.wsStatus = 'disconnected'
      this.sessionEnded = true
      this.sessionId = null
      this.streaming = false
      this.streamBuffer = ''
      this.sending = false
      clearSessionStorage(this.channelId)
      const last = this.messages[this.messages.length - 1]
      if (!last || last.role !== 'system' || last.content !== tip) {
        this.messages.push({ role: 'system', content: tip })
        this.scrollBottom()
      }
    },
    handleSocketMessage(data) {
      if (data.type === 'connected') {
        this.wsStatus = 'connected'
        return
      }
      if (data.type === 'session') {
        this.sessionId = data.sessionId
        if (data.visitorId) {
          this.visitorId = data.visitorId
        }
        this.sessionEnded = false
        this.wsStatus = 'connected'
        this.persistSession()
        return
      }
      if (data.type === 'session_end') {
        const tip = data.message || '会话已结束（超时或已关闭），发送消息将开启新会话'
        this.markDisconnected(tip)
        return
      }
      if (data.type === 'error') {
        this.messages.push({ role: 'system', content: data.message || '发送失败，请稍后重试' })
        this.sending = false
        this.streaming = false
        this.scrollBottom()
        return
      }
      if (data.type === 'agent_mode') {
        this.messages.push({ role: 'system', content: data.message || '当前为人工客服接待' })
        this.sending = false
        this.streaming = false
        this.scrollBottom()
        return
      }
      if (data.type === 'bot_mode') {
        this.messages.push({ role: 'system', content: data.message || '已转接回智能客服' })
        this.scrollBottom()
        return
      }
      if (data.type === 'agent_message') {
        this.messages.push({ role: 'agent', content: data.content || '' })
        this.sending = false
        this.streaming = false
        this.scrollBottom()
        return
      }
      if (data.type === 'bot_message') {
        this.messages.push({ role: 'bot', content: data.content || '' })
        this.sending = false
        this.streaming = false
        this.scrollBottom()
        return
      }
      if (data.type === 'stream_start') {
        this.streaming = true
        this.streamBuffer = ''
        this.scrollBottom()
        return
      }
      if (data.type === 'stream') {
        this.streamBuffer += data.content || ''
        this.scrollBottom()
        return
      }
      if (data.type === 'stream_end') {
        this.messages.push({ role: 'bot', content: this.streamBuffer })
        this.streaming = false
        this.streamBuffer = ''
        this.sending = false
        this.scrollBottom()
      }
    },
    /** 断开后重新开聊：保留历史，重建 WS、不带旧 sessionId */
    async startFreshChat() {
      this.messages.push({ role: 'system', content: '已开启新会话，可以继续提问' })
      this.sessionId = null
      this.sessionEnded = false
      this.streaming = false
      this.streamBuffer = ''
      clearSessionStorage(this.channelId)
      this.persistSession()
      this.userScrolledUp = false
      this.scrollBottom()
      await this.connectWebSocket()
    },
    async sendQuestion(text) {
      const content = (text || '').trim()
      if (!content || this.sending) return
      this.inputText = ''
      this.sending = true
      this.userScrolledUp = false

      try {
        // 已断开 / 会话已结束：先重建会话再发
        if (this.sessionEnded || this.wsStatus === 'disconnected' || !this.isWsOpen()) {
          await this.startFreshChat()
        }

        this.messages.push({ role: 'user', content })
        this.scrollBottom(true)

        if (this.isWsOpen()) {
          this.ws.send(JSON.stringify({
            type: 'chat',
            channelId: Number(this.channelId),
            sessionId: this.sessionId || undefined,
            visitorId: this.visitorId || undefined,
            content,
            visitorName: '网站访客'
          }))
          return
        }

        // WS 仍不可用：HTTP 新建会话并发送
        const sessionRes = await createChatSession({
          channelId: Number(this.channelId),
          visitorId: this.visitorId || undefined,
          visitorName: '网站访客'
        })
        const session = sessionRes.data && sessionRes.data.session
          ? sessionRes.data.session
          : sessionRes.data
        this.sessionId = session.id
        this.visitorId = session.visitorId || sessionRes.data.visitorId || this.visitorId
        this.sessionEnded = false
        this.persistSession()

        const res = await sendChatMessage({
          sessionId: this.sessionId,
          robotId: this.channel.robotId,
          enterpriseId: this.channel.enterpriseId,
          content
        })
        if (res.data && res.data.agentMode) {
          this.messages.push({ role: 'system', content: '当前为人工客服接待，消息已转交坐席' })
        } else {
          this.messages.push({ role: 'bot', content: (res.data && res.data.reply) || '' })
        }
        this.sending = false
        this.scrollBottom()
      } catch (e) {
        this.messages.push({ role: 'system', content: '发送失败，请稍后重试' })
        this.sending = false
        this.wsStatus = 'disconnected'
        this.sessionEnded = true
        this.scrollBottom()
      }
    },
    onMessageScroll() {
      const box = this.$refs.messageBox
      if (!box) return
      const distance = box.scrollHeight - box.scrollTop - box.clientHeight
      this.userScrolledUp = distance > 80
    },
    scrollBottom(force = false) {
      if (this.userScrolledUp && !force) return
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          const anchor = this.$refs.scrollAnchor
          if (anchor) {
            anchor.scrollIntoView({ behavior: force ? 'auto' : 'smooth', block: 'end' })
            return
          }
          const box = this.$refs.messageBox
          if (box) box.scrollTop = box.scrollHeight
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.chat-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(165deg, #ecfdf5 0%, #f0fdfa 35%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.chat-shell {
  width: 100%;
  max-width: 480px;
  height: min(720px, calc(100dvh - 40px));
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 4px 6px rgba(20, 184, 166, 0.06),
    0 20px 50px rgba(20, 184, 166, 0.14);
  border: 1px solid rgba(204, 251, 241, 0.8);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 50%, #14b8a6 100%);
  color: #115e59;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(20, 184, 166, 0.2);

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }

  .header-info {
    min-width: 0;
    flex: 1;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    margin: 2px 0 0;
    font-size: 12px;
    opacity: 0.88;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-dot {
    flex-shrink: 0;
    font-size: 11px;
    background: rgba(255, 255, 255, 0.45);
    padding: 5px 10px;
    border-radius: 999px;
    backdrop-filter: blur(4px);

    &.connected::before,
    &.connecting::before,
    &.disconnected::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 5px;
      vertical-align: middle;
    }

    &.connected::before {
      background: #059669;
      box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.3);
    }

    &.connecting::before {
      background: #d97706;
      animation: blink 1.2s infinite;
    }

    &.disconnected {
      background: rgba(254, 226, 226, 0.95);
      color: #991b1b;

      &::before {
        background: #dc2626;
      }
    }
  }
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 14px 8px;
  background:
    radial-gradient(circle at 20% 0%, rgba(204, 251, 241, 0.35) 0%, transparent 50%),
    #f8fafc;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(20, 184, 166, 0.25);
    border-radius: 4px;
  }
}

.scroll-anchor {
  height: 1px;
  flex-shrink: 0;
}

.message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 14px;

  &.user {
    justify-content: flex-end;

    .bubble {
      background: linear-gradient(135deg, #14b8a6, #0d9488);
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 8px rgba(20, 184, 166, 0.25);
    }
  }

  &.bot,
  &.agent {
    justify-content: flex-start;
  }

  &.bot .bubble {
    background: #fff;
    color: #334155;
    border: 1px solid #e2e8f0;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  }

  &.agent .bubble {
    background: linear-gradient(135deg, #fff7ed, #ffedd5);
    color: #9a3412;
    border: 1px solid #fed7aa;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(154, 52, 18, 0.08);
  }

  &.system {
    justify-content: center;
    margin-bottom: 10px;
  }
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #fff;
}

.system-tip {
  max-width: 88%;
  font-size: 12px;
  color: #64748b;
  background: rgba(226, 232, 240, 0.7);
  padding: 6px 14px;
  border-radius: 999px;
  text-align: center;
  line-height: 1.5;
}

.bubble {
  max-width: calc(100% - 44px);
  padding: 10px 14px;
  border-radius: 16px;
  line-height: 1.65;
  font-size: 14px;
  word-break: break-word;
}

.typing {
  min-width: 48px;
}

.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;

  i {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #94a3b8;
    animation: dotBounce 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.recommend-bar {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px dashed #ccfbf1;
}

.recommend-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: #0f766e;
}

.recommend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 96px;
  overflow-y: auto;
}

.recommend-chip {
  border: 1px solid #99f6e4;
  background: #ecfdf5;
  color: #0f766e;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background: #d1fae5;
    border-color: #5eead4;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.chat-footer {
  padding: 10px 12px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  flex-shrink: 0;
}

.chat-footer__input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-wrap {
  flex: 1;
  min-width: 0;

  ::v-deep .el-textarea__inner {
    border-radius: 20px;
    border-color: #e2e8f0;
    padding: 10px 14px;
    font-size: 14px;
    line-height: 1.5;
    background: #f8fafc;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #5eead4;
      box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.25);
      background: #fff;
    }
  }
}

.send-btn {
  flex-shrink: 0;
  min-width: 64px;
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #5eead4, #14b8a6);
  border: none;
  color: #115e59;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
  transition: transform 0.15s, box-shadow 0.2s;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2dd4bf, #0d9488);
    color: #fff;
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &.is-disabled {
    opacity: 0.55;
    box-shadow: none;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@media (max-width: 520px) {
  .chat-page {
    padding: 0;
    align-items: stretch;
  }

  .chat-shell {
    max-width: none;
    height: 100dvh;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }

  .chat-header {
    padding-top: max(14px, env(safe-area-inset-top));
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }

  .chat-body {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }

  .chat-footer {
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(10px, env(safe-area-inset-right));
  }

  .bubble {
    max-width: calc(100% - 40px);
    font-size: 15px;
  }

  .send-btn {
    min-width: 56px;
    height: 44px;
  }

  .send-btn-text {
    font-size: 14px;
  }
}
</style>
