<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="套餐名称">
          <el-input
            v-model="queryParams.packageName"
            placeholder="请输入套餐名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="套餐状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择套餐状态"
            clearable
          >
            <el-option
              :key="0"
              :label="'下架'"
              :value="0"
            />
            <el-option
              :key="1"
              :label="'上架'"
              :value="1"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="handleAdd">新建</el-button>
      <el-button :disabled="multiple" @click="handleDeleteBatch">批量删除</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="robotPackageList"
        @selection-change="handleSelectionChange"
        class="modern-table"
      >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="套餐名称" prop="packageName"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="套餐说明" prop="packageDesc"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="套餐价格" prop="packagePrice"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="机器人数量" prop="robotLimit"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="排序值" prop="sortNum"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="套餐状态" prop="status"  align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ getEnumLabel(scope.row.status, statusEnumMap) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            type="text"
            style="color: #f56c6c;"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[5, 10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加或修改对话框（有富文本/MD 时宽度 50%，否则 600px） -->
    <el-dialog :title="title" :visible.sync="open"  width="600px"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="套餐名称" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐说明" prop="packageDesc">
          <el-input
            v-model="form.packageDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入套餐说明"
          />
        </el-form-item>
        <el-form-item label="套餐价格" prop="packagePrice">
          <el-input-number
            v-model="form.packagePrice"
            :precision="2"
            :step="0.01"
            :min="0"
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="机器人数量" prop="robotLimit">
          <el-input v-model.number="form.robotLimit" type="number" placeholder="请输入机器人数量" />
        </el-form-item>
        <el-form-item label="排序值" prop="sortNum">
          <el-input v-model.number="form.sortNum" type="number" placeholder="请输入排序值" />
        </el-form-item>
        <el-form-item label="套餐状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="(item, index) in statusOptions"
              :key="index"
              :label="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  pageRobotPackage,
  getRobotPackageById,
  saveRobotPackage,
  updateRobotPackage,
  deleteRobotPackage,
  deleteBatchRobotPackage
} from '@/api/robot_package'
import ImgUpload from '@/components/ImgUpload'
import ImagePreview from '@/components/ImagePreview'
import Pagination from '@/components/Pagination'
import BasicEditor from '@/components/BasicEditor'

export default {
  name: 'RobotPackage',
  components: {
    ImgUpload,
    ImagePreview,
    Pagination,
    BasicEditor
  },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      robotPackageList: [],
      title: '',
      open: false,
      queryParams: {
        current: 1,
        size: 5,
        packageName:  null,
        status:  null
      },
      form: {},
      rules: {
        packageName: [
          { required: true, message: '套餐名称不能为空', trigger: 'blur' }
        ],
        packageDesc: [
          { required: true, message: '套餐说明不能为空', trigger: 'blur' }
        ],
        packagePrice: [
          { required: true, message: '套餐价格不能为空', trigger: 'blur' }
        ],
        robotLimit: [
          { required: true, message: '机器人数量不能为空', trigger: 'blur' }
        ],
        sortNum: [
          { required: true, message: '排序值不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '套餐状态不能为空', trigger: 'change' }
        ]
      }
,
      statusOptions: [{value: 0, label: '下架'},{value: 1, label: '上架'}],

      statusEnumMap: { 0: '下架', 1: '上架' },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询机器人套餐管理列表（范围查询绑定 xxxRange，传参拆成 xxxStart/xxxEnd） */
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      const entity = { ...rest }
      pageRobotPackage(current, size, entity).then(response => {
        const pageData = response.data
        this.robotPackageList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 枚举列展示：根据 value 取 label，无则显示原值 */
    getEnumLabel(val, map) {
      if (map == null || map[val] === undefined) return val
      return map[val]
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {}
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.current = 1
      this.queryParams.size = this.queryParams.size || 5
      this.queryParams.packageName = null
      this.queryParams.status = null
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加机器人套餐管理'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getRobotPackageById(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改机器人套餐管理'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRobotPackage(this.form).then(response => {
              this.$message.success('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            saveRobotPackage(this.form).then(response => {
              this.$message.success('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteRobotPackage(ids)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch() {
      const ids = this.ids
      this.$confirm('是否确认删除选中的' + ids.length + '条数据？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteBatchRobotPackage(ids)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 分页大小改变 */
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.getList()
    },
    /** 当前页改变 */
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
</style>
