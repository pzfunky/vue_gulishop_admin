<template>
  <div>
    <!-- 三级联动 -->
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory"></CategorySelector>
    </el-card>

    <!-- 属性列表 -->
    <el-card style="margin-top:20px">

    </el-card>
  </div>
</template>

<script>
export default {
    name:'AttrList',
    data(){
      return {
        category1Id:'',
        category2Id:'',
        category3Id:'',
        attrList:[]
      }
    },
    methods:{
      handlerCategory({categoryId,level}){
        if(level === 1){
          this.category1Id = categoryId
          //子组件重新选择一级,清空二三级id和属性列表
          this.category2Id = ''
          this.category3Id = ''
          this.attrList = []
        }else if(level === 2){
          this.category2Id = categoryId
          //子组件重新选择二级,清空三级id和属性列表
          this.category3Id = ''
          this.attrList = []
        }else if(level === 3){
          this.category3Id = categoryId
          //发请求拿平台属性的列表数据
          this.getAttrList()
        }
      },
      //请求获取属性
      getAttrList(){
        
      }
    }
}
</script>

<style lang="scss" scoped>

</style>