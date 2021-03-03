<template>
  <div>
    <el-form>
      <el-form-item label="SPU名称" label-width="100px">
        {{spu.spuName}}
      </el-form-item>
      
      <el-form-item label="SKU名称" label-width="100px">
        <el-input placeholder="SKU名称" v-model="skuForm.skuName"></el-input>        
      </el-form-item>

      <el-form-item label="价格(元)" label-width="100px">
        <el-input placeholder="价格(元)" type="number" v-model="skuForm.price"></el-input>        
      </el-form-item>

      <el-form-item label="重量(千克)" label-width="100px">
        <el-input placeholder="重量(千克)" type="number" v-model="skuForm.weight"></el-input>        
      </el-form-item>

      <el-form-item label="规格描述" label-width="100px">
        <el-input placeholder="规格描述" type="textarea" rows="4" v-model="skuForm.skuDesc"></el-input>        
      </el-form-item>

      <el-form-item label="平台属性" label-width="100px">
        <el-form :inline='true'>
          <el-form-item 
            :label="attr.attrName" 
            label-width="100px" 
            v-for="(attr,index) in attrList"
            :key="attr.id"
          >
            <el-select v-model="attr.attrIdValueId" placeholder="请选择">
              <el-option 
                :label="attrValue.valueName" 
                :value="`${attr.id}:${attrValue.id}`" 
                v-for="(attrValue,index) in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>            
          </el-form-item>          
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性" label-width="100px">
        <el-form :inline='true'>
          <el-form-item 
            :label="saleAttr.saleAttrName" 
            label-width="100px" 
            v-for="(saleAttr,index) in spuSaleAttrList"
            :key="saleAttr.id"
          >
            <el-select v-model="saleAttr.saleAttrIdValueId" placeholder="请选择">
              <el-option 
                :label="saleValue.saleAttrValueName" 
                :value="`${saleAttr.id}:${saleValue.id}`"  
                v-for="(saleValue,index) in saleAttr.spuSaleAttrValueList"
                :key="saleValue.id"
              ></el-option>
            </el-select>            
          </el-form-item>          
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表" label-width="100px">
        <el-table :data="spuImageList" border style="width:100%" @selection-change="handleSelectionChange">

          <el-table-column type="selection" width="55"></el-table-column>

          <el-table-column prop="prop" label="图片" width="width">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" style="height:60px" alt="">
            </template>
          </el-table-column>

          <el-table-column prop="imgName" label="名称" width="width"></el-table-column>

          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-button v-if="row.isDefault === '0'" type="primary" size="mini" @click="setDefaultImg(row,spuImageList)">设为默认</el-button>
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>

        </el-table>        
      </el-form-item>
      

      <el-form-item>
        <el-button type="primary" @click="save">立即创建</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
    
  </div>
</template>

<script>
import { category } from '@/api/product'
export default {
  name: 'SkuForm',
  props:['visible'],
  data(){
    return {
      spu:{},
      spuSaleAttrList:[],
      attrList:[],
      spuImageList:[],  //请求获取的spu图片列表,需要在页面展示
      skuImageList:[],  //我们选择了spu的图片列表后,组成的sku图片列表收集在这里
      skuForm:{
        //从父组件传过来的
        spuId:'',
        category3Id:'',
        tmId:'',

        //这四个通过v-model收集
        skuName:'',
        price:'',
        weight:'',
        skuDesc:'',

        //通过代码去收集
        skuAttrValueList:[],
        skuDefaultImg:'', //设置默认图片的路径

        skuImageList:[],
        skuSaleAttrValueList:[]
      }
    }
  },
  methods:{
    //添加sku时初始化数据
    async getAddSkuFormInitData(row,category1Id,category2Id){
      this.spu = row
      //根据一级二级三级id获取平台属性
      const promise1 = this.$API.attr.getList(category1Id,category2Id,row.category3Id)
      //获取指定SPU的id对应的销售属性列表
      const promise2 = this.$API.sku.getSpuSaleAttrList(row.id)
      //获取指定SPU的id对应的图片列表
      const promise3 = this.$API.sku.getSpuImageList(row.id)
      //使用promise.all来判断是否全部请求成功
      const result = await Promise.all([promise1,promise2,promise3])
      //result是三个promise成功结果组成的数组
      this.attrList = result[0].data
      this.spuSaleAttrList = result[1].data

      let spuImageList = result[2].data
      //这样做可以避免以后每个图片后期都要使用$set
      //因为在这里我们添加好属性,才赋值给响应式属性spuImageList,因此内部的isDefault也是响应式数据
      spuImageList.forEach(item => item.isDefault = '0')
      this.spuImageList = spuImageList   
    },
    //收集sku图片列表的回调
    //sku的图片列表是从spu图片列表当中选择来的,选择了几个,这几个选择的图片组成的数组就变为sku的图片列表
    handleSelectionChange(val){
      this.skuImageList = val
    },
    //设置默认图片
    setDefaultImg(row,spuImageList){
      spuImageList.forEach(item => item.isDefault = '0')
      row.isDefault = '1'

      //此时就是收集默认图片路径的最佳时机
      this.skuForm.skuDefaultImg = row.imgUrl
    },
    //添加sku的保存操作
    async save(){
      //获取参数数据
      let {spu,skuForm,attrList,skuImageList,spuSaleAttrList} = this
      //整理参数
      //整理父组件传来的三个数据
      skuForm.spuId = spu.id
      skuForm.category3Id = spu.category3Id
      skuForm.tmId = spu.tmId
      //整理图片列表
      skuImageList = skuImageList.map(item => {
        return {
          imgName:item.imgName,
          imgUrl:item.imgUrl,
          isDefault:item.isDefault,
          spuImgId:item.id
        }
      })
      skuForm.skuImageList = skuImageList
      //整理sku的平台属性列表和销售属性列表
      skuForm.skuAttrValueList = attrList.reduce((prev,item) => {
        //判断哪些平台属性被选过
        if(item.attrIdValueId){
          //把收集的数据转化为需要的属性值结构
          let [attrId,valueId] = item.attrIdValueId.split(':')
          let obj = {attrId,valueId}
          console.log(obj);
          prev.push(obj)
        }
        return prev
      },[])
      skuForm.skuSaleAttrValueList = spuSaleAttrList.reduce((prev,item) => {
        if(item.saleAttrIdValueId){
          //把收集的数据转化为需要的属性值结构
          let [saleAttrId,saleAttrValueId] = item.saleAttrIdValueId.split(':')
          let obj = {saleAttrId,saleAttrValueId}
          console.log(obj);
          prev.push(obj)
        }
        return prev
      },[])
      //发请求
      try {
        await this.$API.sku.addUpdate(skuForm)
        //提示成功
        this.$message.success('保存sku成功')
        //返回spu列表页面,不需要重新获取spu列表数据
        this.$emit('update:visible',false)
        //清空sku相关data数据
        this.resetData()
      } catch (error) {
        //提示失败
        this.$message.warning('保存sku失败')
      }
    },
    //重置data
    resetData(){
      this.spu = {}
      this.spuSaleAttrList = []
      this.attrList = []
      this.spuImageList = []  //请求获取的spu图片列表,需要在页面展示
      this.skuImageList = []  //我们选择了spu的图片列表后,组成的sku图片列表收集在这里
      this.skuForm = {
        //从父组件传过来的
        spuId:'',
        category3Id:'',
        tmId:'',
        //这四个通过v-model收集
        skuName:'',
        price:'',
        weight:'',
        skuDesc:'',
        //通过代码去收集
        skuAttrValueList:[],
        skuDefaultImg:'', //设置默认图片的路径
        skuImageList:[],
        skuSaleAttrValueList:[]
      }
    },
    //添加sku的取消操作
    cancel(){
      //返回到列表页
      this.$emit('update:visible',false)
      //重置data数据
      this.resetData()
    }
  }
}
</script>

