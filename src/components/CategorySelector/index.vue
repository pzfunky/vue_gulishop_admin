<template>
  <div>
    <el-form :inline="true" class="demo-form-inline" :model="cForm" :disabled="!isShowList">

      <el-form-item label="一级分类">
        <el-select v-model="cForm.category1Id" placeholder="请选择" @change="handlerCategory1">
          <el-option 
            :label="c1.name" 
            :value="c1.id" 
            v-for="(c1,index) in category1List"
            :key="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="二级分类">
        <el-select v-model="cForm.category2Id" placeholder="请选择" @change="handlerCategory2">
          <el-option 
            :label="c2.name" 
            :value="c2.id" 
            v-for="(c2,index) in category2List"
            :key="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="三级分类">
        <el-select v-model="cForm.category3Id" placeholder="请选择" @change="handlerCategory3">
          <el-option 
            :label="c3.name" 
            :value="c3.id" 
            v-for="(c3,index) in category3List"
            :key="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>

    </el-form>

  </div>
</template>

<script>
export default {
  name:'CategorySelector',
  // props:{
  //   isShowList:{
  //     default:true
  //   }
  // },
  props:['isShowList'],
  data() {
    return {
      category1List:[],
      category2List:[],
      category3List:[],
      cForm:{
        category1Id:'',
        category2Id:'',
        category3Id:'',
      }
    }
  },
  mounted(){
    this.getCategory1List()
  },
  methods: {
    async getCategory1List(){
      const result = await this.$API.category.getCategory1()
      if(result.code === 200){
        this.category1List = result.data
      }
    },
    //选中一级分类的回调
    async handlerCategory1(category1Id){
      //用户选中一级分类,需要清空二级三级分类,要触发自定义事件把1级id传给父组件
      this.category2List = []
      this.category3List = []
      this.cForm.category2Id = ''
      this.cForm.category3Id = ''
      this.$emit('handlerCategory',{categoryId:category1Id,level:1})
      const result = await this.$API.category.getCategory2(category1Id)
      if(result.code === 200){
        this.category2List = result.data
      }
    },
    //选中二级分类的回调
    async handlerCategory2(category2Id){
      //用户选中二级分类,需要清空三级分类,要触发自定义事件把2级id传给父组件
      this.category3List = []
      this.cForm.category3Id = ''
      const result = await this.$API.category.getCategory3(category2Id)
      this.$emit('handlerCategory',{categoryId:category2Id,level:2})
      if(result.code === 200){
        this.category3List = result.data
      }
    },
    //选中三级分类的回调
    async handlerCategory3(category3Id){
      //用户选中三级分类,要触发自定义事件把3级id传给父组件
      this.$emit('handlerCategory',{categoryId:category3Id,level:3})
    },


  }
}
</script>

<style lang="scss" scoped>

</style>