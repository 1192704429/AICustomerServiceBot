<template>
  <div class="workbench-page">
    <div class="workbench-shell">
      <!-- 左侧会话列表 -->
      <aside class="session-panel">
        <div class="panel-head">
          <h3>进行中会话</h3>
          <div class="panel-head-actions">
            <span :class="['ws-dot', wsStatus]">{{ wsStatusText }}</span>
            <el-button type="text" icon="el-icon-refresh" :loading="loadingSessions" @click="loadSessions" />
          </div>
        </div>
        <div v-if="!sessions.length && !loadingSessions" class="empty-tip">暂无进行中的会话</div>
        <div class="session-list">
          <div
            v-for="item in sessions"
            :key="item.id"
            :class="['session-item', { active: currentSession && currentSession.id === item.id }]"
            @click="selectSession(item)"
          >
            <img :src="visitorAvatar" alt="" class="session-avatar">
            <div class="session-body">
              <div class="session-top">
                <span class="visitor-name">{{ item.visitorName || '访客' }}</span>
                <el-tag size="mini" :type="statusTagType(item.sessionStatus)">{{ statusText(item.sessionStatus) }}</el-tag>
              </div>
              <div class="session-meta">{{ item.channelName || '渠道' }} · {{ item.robotName || '机器人' }}</div>
              <div class="session-time">{{ formatTime(item.lastChatTime) }}</div>
              <div v-if="item.sessionStatus === 2 && item.realName" class="session-agent">接管：{{ item.realName }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧聊天区 -->
      <main class="chat-panel">
        <template v-if="currentSession">
          <header class="chat-head">
            <div>
              <h3>{{ bindInfo.visitorName || currentSession.visitorName || '访客' }}</h3>
              <p>
                {{ bindInfo.channelName || currentSession.channelName }}
                · {{ bindInfo.robotName || currentSession.robotName }}
                · {{ bindInfo.sessionNo || currentSession.sessionNo }}
              </p>
            </div>
            <div class="chat-actions">
              <el-tag :type="statusTagType(bindInfo.sessionStatus || currentSession.sessionStatus)">
                {{ statusText(bindInfo.sessionStatus || currentSession.sessionStatus) }}
              </el-tag>
              <el-button
                v-if="canTakeover"
                type="primary"
                size="small"
                :loading="takingOver"
                @click="handleTakeover"
              >人工接管</el-button>
              <el-button
                v-if="canReleaseToBot"
                type="warning"
                size="small"
                plain
                :loading="releasingToBot"
                @click="handleReleaseToBot"
              >转接机器人</el-button>
              <el-button
                v-if="canEnd"
                type="danger"
                size="small"
                plain
                :loading="ending"
                @click="handleEnd"
              >结束会话</el-button>
            </div>
          </header>

          <div v-if="takenByOther" class="notice-bar warning">
            该会话已由 <strong>{{ bindInfo.agentName || currentSession.realName }}</strong> 接管，您无法发送消息
          </div>
          <div v-else-if="!canSend && bindInfo.sessionStatus === 1" class="notice-bar info">
            当前为机器人接待，点击「人工接管」后可回复访客
          </div>
          <div v-else-if="canSend" class="notice-bar success">
            您已接管该会话，AI 将不再自动回复。如需恢复机器人接待，可点击「转接机器人」
          </div>

          <div ref="messageBox" class="message-box">
            <div
              v-for="(msg, idx) in messages"
              :key="msg.id || ('m-' + idx)"
              :class="['msg-row', msg.role]"
            >
              <img :src="avatarOf(msg.role)" alt="" class="msg-avatar">
              <div class="msg-main">
                <div class="msg-label">{{ roleLabel(msg.role) }}</div>
                <div class="msg-bubble">
                  <ChatMessageContent
                    :content="msg.content"
                    :variant="msg.role === 'visitor' ? 'bot' : (msg.role === 'agent' ? 'user' : 'agent')"
                  />
                </div>
              </div>
            </div>
          </div>

          <footer class="chat-input">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="3"
              resize="none"
              :disabled="!canSend || sending"
              :placeholder="canSend ? '输入回复内容，Enter 发送' : '请先接管会话后再回复'"
              @keyup.enter.native.exact="sendMessage"
            />
            <el-button
              type="primary"
              :disabled="!canSend"
              :loading="sending"
              @click="sendMessage"
            >发送</el-button>
          </footer>
        </template>

        <div v-else class="chat-empty">
          <i class="el-icon-chat-line-round" />
          <p>请从左侧选择一个会话</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listActiveSessions, getSessionBindInfo, takeoverSession, releaseSessionToBot, endSession, getQueueBind } from '@/api/chat_im'
import { listChatMessage } from '@/api/chat_message'
import { createImWs } from '@/utils/im-ws'
import { parseTime } from '@/utils'
import ChatMessageContent from '@/components/ChatMessageContent'

const STATUS_BOT = 1
const STATUS_AGENT = 2
const STATUS_END = 3

const DEFAULT_VISITOR_AVATAR = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const DEFAULT_BOT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const DEFAULT_AGENT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

export default {
  name: 'AgentWorkbench',
  components: { ChatMessageContent },
  data() {
    return {
      sessions: [],
      loadingSessions: false,
      currentSession: null,
      bindInfo: {},
      messages: [],
      inputText: '',
      sending: false,
      takingOver: false,
      releasingToBot: false,
      ending: false,
      imClient: null,
      subscribedChannel: null,
      queueChannel: null,
      wsStatus: 'connecting'
    }
  },
  computed: {
    ...mapGetters(['id', 'name', 'avatar']),
    visitorAvatar() {
      return DEFAULT_VISITOR_AVATAR
    },
    agentAvatar() {
      return this.avatar || DEFAULT_AGENT_AVATAR
    },
    botAvatar() {
      return DEFAULT_BOT_AVATAR
    },
    currentStatus() {
      return this.bindInfo.sessionStatus || (this.currentSession && this.currentSession.sessionStatus)
    },
    currentAgentId() {
      return this.bindInfo.agentId || (this.currentSession && this.currentSession.userId)
    },
    canTakeover() {
      return this.currentStatus === STATUS_BOT
    },
    canReleaseToBot() {
      return this.canSend
    },
    canSend() {
      return this.currentStatus === STATUS_AGENT && Number(this.currentAgentId) === Number(this.id)
    },
    takenByOther() {
      return this.currentStatus === STATUS_AGENT && Number(this.currentAgentId) !== Number(this.id)
    },
    canEnd() {
      return this.currentSession && this.currentStatus !== STATUS_END &&
        (this.canSend || this.currentStatus === STATUS_BOT)
    },
    wsStatusText() {
      if (this.wsStatus === 'connected') return '已连接'
      if (this.wsStatus === 'connecting') return '连接中'
      return '重连中'
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        if (val && !this.imClient) {
          this.connectIm()
        }
      }
    }
  },
  created() {
    this.bootstrap()
  },
  beforeDestroy() {
    this.unsubscribeChannel()
    if (this.queueChannel && this.imClient) {
      this.imClient.unsubscribe(this.queueChannel)
    }
    if (this.imClient) this.imClient.close()
    this.imClient = null
  },
  methods: {
    async bootstrap() {
      if (this.id) this.connectIm()
      await this.loadSessions()
      try {
        const bindRes = await getQueueBind()
        this.queueChannel = (bindRes.data && bindRes.data.queueChannel) || null
        if (this.queueChannel && this.imClient) {
          this.imClient.subscribe(this.queueChannel)
        }
      } catch (e) {
        // ignore
      }
    },
    connectIm() {
      if (!this.id || this.imClient) return
      this.wsStatus = 'connecting'
      try {
        this.imClient = createImWs(this.id, {
          onopen: () => {
            this.wsStatus = 'connected'
            if (this.queueChannel) {
              this.imClient.subscribe(this.queueChannel)
            }
            if (this.subscribedChannel) {
              this.imClient.subscribe(this.subscribedChannel)
            }
          },
          onmessage: (data) => this.handleImMessage(data),
          onclose: () => {
            this.wsStatus = 'reconnecting'
          },
          onerror: () => {
            this.wsStatus = 'reconnecting'
          }
        })
      } catch (e) {
        this.imClient = null
        this.wsStatus = 'reconnecting'
        console.error('IM 连接失败', e)
      }
    },
    async loadSessions(silent) {
      if (!silent) this.loadingSessions = true
      try {
        const res = await listActiveSessions()
        this.sessions = res.data || []
        if (this.currentSession) {
          const updated = this.sessions.find(s => s.id === this.currentSession.id)
          if (!updated) {
            this.currentSession = null
            this.bindInfo = {}
            this.messages = []
            this.unsubscribeChannel()
          } else {
            this.currentSession = updated
            this.bindInfo = {
              ...this.bindInfo,
              sessionStatus: updated.sessionStatus,
              agentId: updated.userId,
              agentName: updated.realName
            }
          }
        }
      } finally {
        this.loadingSessions = false
      }
    },
    async selectSession(session) {
      if (this.currentSession && this.currentSession.id === session.id) return
      this.unsubscribeChannel()
      this.currentSession = session
      this.messages = []
      this.inputText = ''
      await this.refreshSessionDetail()
      this.subscribeChannel(this.bindInfo.imChannel)
    },
    async refreshSessionDetail() {
      if (!this.currentSession) return
      const [bindRes, msgRes] = await Promise.all([
        getSessionBindInfo(this.currentSession.id),
        listChatMessage({ sessionId: this.currentSession.id })
      ])
      this.bindInfo = bindRes.data || {}
      this.messages = this.mapMessages(msgRes.data || [])
      this.scrollBottom()
    },
    mapMessages(list) {
      return (list || [])
        .slice()
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .map(item => ({
          id: item.id,
          role: this.messageRole(item.messageRole),
          content: item.messageContent || ''
        }))
    },
    messageRole(role) {
      if (role === 1) return 'visitor'
      if (role === 3) return 'agent'
      return 'bot'
    },
    roleLabel(role) {
      if (role === 'visitor') return '访客'
      if (role === 'agent') return '客服'
      return '机器人'
    },
    avatarOf(role) {
      if (role === 'visitor') return this.visitorAvatar
      if (role === 'agent') return this.agentAvatar
      return this.botAvatar
    },
    subscribeChannel(channel) {
      if (!channel || !this.imClient) return
      this.subscribedChannel = channel
      this.imClient.subscribe(channel)
    },
    unsubscribeChannel() {
      if (this.subscribedChannel && this.imClient) {
        this.imClient.unsubscribe(this.subscribedChannel)
      }
      this.subscribedChannel = null
    },
    handleImMessage(data) {
      if (data.type === 'error') {
        this.$message.error((data && data.message) || '实时通道异常')
        if (this.sending) {
          this.sending = false
        }
        return
      }

      // 企业队列：会话列表实时更新
      if (data.type === 'event' && this.isQueueEvent(data)) {
        this.handleQueueEvent(data)
        return
      }

      if (data.type === 'message') {
        const msgSessionId = data.sessionId || this.parseSessionId(data.channel)
        if (msgSessionId) {
          this.bumpSessionActivity(msgSessionId)
        }
        if (!this.currentSession) return
        if (msgSessionId && Number(msgSessionId) !== Number(this.currentSession.id)) return
        this.appendMessage({
          id: data.messageId || `ws-${Date.now()}`,
          role: this.imRole(data),
          content: data.content || ''
        })
        return
      }

      if (!this.currentSession) return
      const sessionId = this.currentSession.id

      if (data.type === 'event') {
        if (data.event === 'takeover') {
          this.bindInfo.sessionStatus = STATUS_AGENT
          this.bindInfo.agentId = this.parseAgentId(data.agentUserId)
          this.bindInfo.agentName = data.agentName || this.bindInfo.agentName
          this.updateSessionInList({
            id: sessionId,
            sessionStatus: STATUS_AGENT,
            userId: this.bindInfo.agentId,
            realName: this.bindInfo.agentName
          })
        }
        if (data.event === 'release') {
          this.bindInfo.sessionStatus = STATUS_BOT
          this.bindInfo.agentId = null
          this.bindInfo.agentName = null
          this.updateSessionInList({
            id: sessionId,
            sessionStatus: STATUS_BOT,
            userId: null,
            realName: null
          })
        }
        if (data.event === 'session_end' && Number(data.sessionId) === Number(sessionId)) {
          this.removeSessionFromList(sessionId)
          this.currentSession = null
          this.bindInfo = {}
          this.messages = []
          this.unsubscribeChannel()
        }
      }
    },
    isQueueEvent(data) {
      return this.queueChannel && data.channel === this.queueChannel
    },
    handleQueueEvent(data) {
      const event = data.event
      const payload = { ...data }
      delete payload.type
      delete payload.event
      delete payload.channel
      delete payload.from
      delete payload.to
      delete payload.content
      delete payload.timestamp

      if (event === 'session_created') {
        this.upsertSession(payload, true)
        return
      }
      if (event === 'session_updated') {
        this.upsertSession(payload, true)
        return
      }
      if (event === 'session_end') {
        this.removeSessionFromList(payload.id || payload.sessionId)
        if (this.currentSession && Number(this.currentSession.id) === Number(payload.id || payload.sessionId)) {
          this.currentSession = null
          this.bindInfo = {}
          this.messages = []
          this.unsubscribeChannel()
        }
      }
    },
    normalizeSession(raw) {
      if (!raw || raw.id == null) return null
      return {
        id: raw.id,
        sessionNo: raw.sessionNo,
        visitorName: raw.visitorName,
        sessionStatus: raw.sessionStatus,
        userId: raw.userId,
        realName: raw.realName,
        robotName: raw.robotName,
        channelName: raw.channelName,
        lastChatTime: raw.lastChatTime
      }
    },
    upsertSession(raw, toFront) {
      const session = this.normalizeSession(raw)
      if (!session) return
      const idx = this.sessions.findIndex(s => Number(s.id) === Number(session.id))
      if (idx >= 0) {
        this.$set(this.sessions, idx, { ...this.sessions[idx], ...session })
      } else if (session.sessionStatus !== STATUS_END) {
        if (toFront) {
          this.sessions.unshift(session)
        } else {
          this.sessions.push(session)
        }
      }
      this.sortSessions()
      if (this.currentSession && Number(this.currentSession.id) === Number(session.id)) {
        this.currentSession = { ...this.currentSession, ...session }
        this.bindInfo = {
          ...this.bindInfo,
          sessionStatus: session.sessionStatus,
          agentId: session.userId,
          agentName: session.realName
        }
      }
    },
    updateSessionInList(partial) {
      this.upsertSession(partial, false)
    },
    removeSessionFromList(sessionId) {
      this.sessions = this.sessions.filter(s => Number(s.id) !== Number(sessionId))
    },
    bumpSessionActivity(sessionId) {
      const idx = this.sessions.findIndex(s => Number(s.id) === Number(sessionId))
      if (idx > 0) {
        const item = this.sessions[idx]
        this.sessions.splice(idx, 1)
        this.sessions.unshift(item)
      }
    },
    sortSessions() {
      this.sessions.sort((a, b) => {
        const ta = a.lastChatTime ? new Date(a.lastChatTime).getTime() : 0
        const tb = b.lastChatTime ? new Date(b.lastChatTime).getTime() : 0
        return tb - ta
      })
    },
    imRole(data) {
      const role = data.role
      if (role === 1 || (data.from && data.from.startsWith('visitor.'))) return 'visitor'
      if (role === 3 || (data.from && data.from.startsWith('agent.'))) return 'agent'
      return 'bot'
    },
    parseSessionId(channel) {
      if (!channel) return null
      const m = String(channel).match(/chat\.session\.(\d+)/)
      return m ? m[1] : null
    },
    parseAgentId(agentUserId) {
      if (!agentUserId) return null
      const raw = String(agentUserId).replace(/^agent\./, '')
      const n = Number(raw)
      return Number.isNaN(n) ? null : n
    },
    appendMessage(msg) {
      if (msg.id != null && this.messages.some(m => String(m.id) === String(msg.id))) {
        return
      }
      const last = this.messages[this.messages.length - 1]
      if (last && last.role === msg.role && last.content === msg.content) {
        return
      }
      this.messages.push(msg)
      this.scrollBottom()
    },
    async handleTakeover() {
      if (!this.currentSession || !this.canTakeover) return
      this.takingOver = true
      try {
        const res = await takeoverSession(this.currentSession.id)
        this.bindInfo = res.data || {}
        const updated = this.sessions.find(s => s.id === this.currentSession.id)
        if (updated) this.currentSession = updated
        this.$message.success('接管成功')
        await this.loadSessions(true)
      } catch (e) {
        this.$message.error((e && e.message) || '接管失败')
      } finally {
        this.takingOver = false
      }
    },
    async handleReleaseToBot() {
      if (!this.currentSession || !this.canReleaseToBot) return
      try {
        await this.$confirm('转接后机器人将恢复自动回复，确定转接吗？', '转接机器人', { type: 'warning' })
      } catch (e) {
        return
      }
      this.releasingToBot = true
      try {
        const res = await releaseSessionToBot(this.currentSession.id)
        this.bindInfo = res.data || {}
        this.inputText = ''
        this.$message.success('已转接回机器人')
        await this.loadSessions(true)
      } catch (e) {
        this.$message.error((e && e.message) || '转接失败')
      } finally {
        this.releasingToBot = false
      }
    },
    async handleEnd() {
      if (!this.currentSession) return
      try {
        await this.$confirm('确定结束该会话吗？', '提示', { type: 'warning' })
      } catch (e) {
        return
      }
      this.ending = true
      try {
        await endSession(this.currentSession.id)
        this.$message.success('会话已结束')
        this.currentSession = null
        this.bindInfo = {}
        this.messages = []
        this.unsubscribeChannel()
        await this.loadSessions()
      } finally {
        this.ending = false
      }
    },
    async sendMessage() {
      const content = (this.inputText || '').trim()
      if (!content || !this.canSend || this.sending) return
      if (!this.imClient || !this.bindInfo.imChannel) {
        this.$message.error('实时通道未就绪，请稍后重试')
        return
      }
      this.sending = true
      this.inputText = ''
      try {
        // 不点对点 to=visitor（访客在 /ws/chat）；频道广播 + 后端落库桥接
        this.imClient.send(this.bindInfo.imChannel, content)
        // 回显由 ChatSessionNotifier 点对点补推；失败时仍可本地兜底
      } catch (e) {
        this.$message.error('发送失败，请检查连接')
        this.inputText = content
      } finally {
        this.sending = false
      }
    },
    statusText(status) {
      if (status === STATUS_AGENT) return '人工接管'
      if (status === STATUS_END) return '已结束'
      return '机器人接待'
    },
    statusTagType(status) {
      if (status === STATUS_AGENT) return 'warning'
      if (status === STATUS_END) return 'info'
      return 'success'
    },
    formatTime(time) {
      if (time == null || time === '') return ''
      // WS 推送可能是毫秒时间戳；HTTP 多为 "yyyy-MM-dd HH:mm:ss"
      if (typeof time === 'number' || (/^\d{10,13}$/.test(String(time)))) {
        return parseTime(time, '{y}-{m}-{d} {h}:{i}') || ''
      }
      if (Array.isArray(time) && time.length >= 5) {
        const [y, m, d, h = 0, i = 0] = time
        const pad = n => String(n).padStart(2, '0')
        return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(i)}`
      }
      const formatted = parseTime(time, '{y}-{m}-{d} {h}:{i}')
      if (formatted) return formatted
      return String(time).replace('T', ' ').slice(0, 16)
    },
    scrollBottom() {
      this.$nextTick(() => {
        const box = this.$refs.messageBox
        if (box) box.scrollTop = box.scrollHeight
      })
    }
  }
}
</script>

<style scoped lang="scss">
.workbench-page {
  padding: 16px;
  min-height: calc(100vh - 84px);
  background: #f1f5f9;
}

.workbench-shell {
  display: flex;
  gap: 16px;
  height: calc(100vh - 116px);
  min-height: 560px;
}

.session-panel {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #0f172a;
  }
}

.panel-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ws-dot {
  font-size: 12px;
  color: #64748b;

  &.connected {
    color: #059669;
  }

  &.connecting,
  &.reconnecting {
    color: #d97706;
  }
}

.empty-tip {
  padding: 40px 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background .15s;

  &:hover {
    background: #f8fafc;
  }

  &.active {
    background: #ecfdf5;
    border-left: 3px solid #14b8a6;
  }
}

.session-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e2e8f0;
}

.session-body {
  flex: 1;
  min-width: 0;
}

.session-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.visitor-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
}

.session-meta,
.session-time,
.session-agent {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.session-agent {
  color: #b45309;
}

.chat-panel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0 0 4px;
    font-size: 18px;
    color: #0f172a;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #64748b;
  }
}

.chat-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-bar {
  padding: 10px 20px;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;

  &.info {
    background: #eff6ff;
    color: #1d4ed8;
  }

  &.success {
    background: #ecfdf5;
    color: #047857;
  }

  &.warning {
    background: #fff7ed;
    color: #c2410c;
  }
}

.message-box {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
}

.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: flex-start;

  // 访客：左侧
  &.visitor {
    flex-direction: row;

    .msg-bubble {
      background: #fff;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
  }

  // 机器人 / 客服：右侧
  &.agent,
  &.bot {
    flex-direction: row-reverse;

    .msg-main {
      align-items: flex-end;
    }

    .msg-label {
      text-align: right;
    }
  }

  &.agent .msg-bubble {
    background: #14b8a6;
    color: #fff;
    border: none;
  }

  &.bot .msg-bubble {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e2e8f0;
}

.msg-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 70%;
  min-width: 0;
}

.msg-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
  padding: 0 2px;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  align-items: flex-end;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;

  i {
    font-size: 48px;
    margin-bottom: 12px;
  }
}
</style>
