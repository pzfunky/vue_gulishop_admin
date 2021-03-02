<template>
  <div>
    <el-form>
      <el-form-item label="SPU名称" label-width="100px">
        <el-input placeholder="SPU名称"></el-input>
      </el-form-item>

      <el-form-item label="品牌" label-width="100px">
        <el-select value="" placeholder="请选择品牌">
          <el-option label="label" value="value"></el-option>
        </el-select>
      </el-form-item>

      <!-- element-UI没有textarea,也是使用input去做 -->
      
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SpuForm',
}
</script>

