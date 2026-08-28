<template>
  <el-tag v-if="displayLabel" :type="tagType" size="small">{{ displayLabel }}</el-tag>
  <span v-else>-</span>
</template>

<script>
export default {
  name: 'EnumTag',
  props: {
    value: {
      type: [String, Number, Boolean],
      default: null
    },
    labelMap: {
      type: Object,
      default: () => ({})
    },
    typeMap: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    displayLabel() {
      if (this.value === null || this.value === undefined || this.value === '') {
        return ''
      }
      const key = typeof this.value === 'boolean' ? this.value : this.value
      return this.labelMap[key] !== undefined ? this.labelMap[key] : String(this.value)
    },
    tagType() {
      const key = typeof this.value === 'boolean' ? this.value : this.value
      return this.typeMap[key] || 'info'
    }
  }
}
</script>
