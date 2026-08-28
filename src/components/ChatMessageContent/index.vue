<template>
  <div :class="['chat-message-content', variant]" v-html="html" />
</template>

<script>
import { renderMarkdown } from '@/utils/markdown'

export default {
  name: 'ChatMessageContent',
  props: {
    content: {
      type: String,
      default: ''
    },
    /** user | bot | agent */
    variant: {
      type: String,
      default: 'bot'
    }
  },
  computed: {
    html() {
      return renderMarkdown(this.content)
    }
  }
}
</script>

<style scoped lang="scss">
.chat-message-content {
  ::v-deep {
    > :first-child {
      margin-top: 0;
    }

    > :last-child {
      margin-bottom: 0;
    }

    p {
      margin: 0 0 0.6em;
    }

    ul,
    ol {
      margin: 0.4em 0;
      padding-left: 1.4em;
    }

    li {
      margin: 0.2em 0;
    }

    blockquote {
      margin: 0.5em 0;
      padding: 0.35em 0.75em;
      border-left: 3px solid currentColor;
      opacity: 0.85;
    }

    pre {
      margin: 0.5em 0;
      padding: 10px 12px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.5;
    }

    code {
      font-family: Consolas, Monaco, 'Courier New', monospace;
      font-size: 0.9em;
    }

    :not(pre) > code {
      padding: 0.15em 0.35em;
      border-radius: 4px;
    }

    a {
      text-decoration: underline;
      word-break: break-all;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 0.5em 0;
      font-size: 13px;
    }

    th,
    td {
      border: 1px solid currentColor;
      padding: 4px 8px;
      opacity: 0.9;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0.6em 0 0.4em;
      font-size: 1em;
      font-weight: 600;
      line-height: 1.4;
    }

    hr {
      margin: 0.6em 0;
      border: none;
      border-top: 1px solid currentColor;
      opacity: 0.25;
    }
  }

  &.bot,
  &.agent {
    ::v-deep {
      pre {
        background: rgba(15, 23, 42, 0.06);
        color: #1e293b;
      }

      :not(pre) > code {
        background: rgba(15, 23, 42, 0.08);
        color: #0f766e;
      }

      a {
        color: #0d9488;
      }
    }
  }

  &.agent {
    ::v-deep {
      :not(pre) > code {
        color: #c2410c;
      }

      a {
        color: #ea580c;
      }
    }
  }

  &.user {
    ::v-deep {
      pre {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
      }

      :not(pre) > code {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }

      a {
        color: #ccfbf1;
      }
    }
  }
}
</style>
