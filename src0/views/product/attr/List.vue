<template>
  <div>
    <!-- 三级联动 -->
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory"/>      
    </el-card>

    <!-- 属性列表 -->
    <el-card style="margin-top:20px">
      <div v-show="isShowList">
        <!-- 添加属性按钮 -->
        <el-button type="primary" @click="showAddDiv" :disabled="!category3Id">添加属性</el-button>
        <!-- 属性列表 -->
        <el-table
          :data="attrList"
          border
          style="width: 100%;margin:20px 0">

          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center">
          </el-table-column>

          <el-table-column
            prop="attrName"
            label="属性名"
            width="150">
          </el-table-column>

          <el-table-column
            prop="attrValueList"
            label="属性值列表"
            width="width">
            <template slot-scope="{row,$index}">
              <el-tag type="success" v-for="attrValue in row.attrValueList" :key="attrValue.id">{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="prop"
            label="操作"
            width="150">
            <template slot-scope="{row,$index}">
              <HintButton type="waring" icon="el-icon-edit" size="mini" title="修改" @click="showUpdateDiv(row)"/>
              <HintButton type="danger" icon="el-icon-delete" size="mini" title="删除"></HintButton>
            </template>
          </el-table-column>

        </el-table>
      </div>

      <div v-show="!isShowList">
        <el-form :inline='true' :model="attrForm">
          <el-form-item label="属性名">
            <el-input placeholder="请输入属性名" v-model="attrForm.attrName"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue">添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table
          :data="attrForm.attrValueList"
          border
          style="width: 100%;margin:20px 0">

          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center">
          </el-table-column>

          <el-table-column
            prop="prop"
            label="属性值名称"
            width="width">
            <template slot-scope="{row,$index}">
              <el-input placeholder="请输入属性值名称" v-model="row.valueName"></el-input>
            </template>
          </el-table-column>

          <el-table-column
            prop="prop"
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <HintButton type="danger" icon="el-icon-delete" size="mini" title="删除"></HintButton>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" icon="el-icon-edit">保存</el-button>
        <el-button @click="isShowList = true" >取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
    name:'AttrList',
    data(){
      return {
        category1Id:'',
        category2Id:'',
        category3Id:'',
        attrList:[],  //商品属性列表
        attrForm:{    //待修改的商品对象
          attrName:'',  //属性名称
          attrValueList:[],
          categoryId:0, //data中不能使用this来获取data中的另一个值 data在初始化时谁先谁后不一定
          categoryLevel:3
        },
        isShowList:true    //标识属性列表是否显示
      }
    },
    methods:{
      //自定义事件的回调
      handlerCategory({categoryId,level}){
        if(level === 1){
          this.category1Id = categoryId
          //子组件重新选择一级,清空二三级id和属性列表
          this.category2Id = ''
          this.category3Id = ''
          this.attrList = []
        }else if(level === 2){
          this.category2Id = categoryId
          //子组件重新选择一级,清空二三级id和属性列表
          this.category3Id = ''
          this.attrList = []
        }else if(level === 3){
          this.category3Id = categoryId
          //发请求拿属性列表
          this.getAttrList()
        }
        this.isShowList = true
      },
      //请求获取属性
      async getAttrList(){
        let {category1Id,category2Id,category3Id} = this
        let result = await this.$API.attr.getList(category1Id,category2Id,category3Id)
        if(result.code === 200){
          this.attrList = result.data
        }
      },
      //重置attrForm
      resetAttrForm(){
        this.attrForm = {    //待修改的商品对象
          attrName:'',  //属性名称
          attrValueList:[],
          categoryId:0, //data中不能使用this来获取data中的另一个值 data在初始化时谁先谁后不一定
          categoryLevel:3
        }
      },
      //点击添加属性的回调 显示添加属性对话框
      showAddDiv(){
        this.isShowList = false
        this.resetAttrForm()
      },
      //点击编辑显示属性编辑对话框
      showUpdateDiv(row){
        this.isShowList = false
        this.attrForm = cloneDeep(row)
      },
      //点击添加属性值的回调
      addAttrValue(){
        this.attrForm.attrValueList.push({})
      }
    }
}
</script>

<style lang="scss" scoped>

</style>