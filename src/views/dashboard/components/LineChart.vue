<template>
  <div :style="{width,height}">

  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') //引入主题
export default {
  name:'LineChart',
  data(){
    return {
      chart:null
    }
  },
  props:{
    width:{
      type:String,
      default:'100%'
    },
    height:{
      type:String,
      default:'350px'
    },
    chartData:{
      type:Object,
      required:true,      
    },
    yTittle:{
      type:String,
      required:true
    }
  },
  mounted(){
    this.initChart()  //初始化数据
  },
  methods:{
    initChart(){
      this.chart = echarts.init(this.$el,'macarons')
      this.setOption(this.chartData)
    },
    setOption({expectedData = [],actualData = []}){
      this.chart.setOption(
        {
          // 图表标题
          title: {
            text: 'ECharts 入门示例'
          },
          //提示信息
          tooltip: {
            trigger:'axis'
          },
          
          //图例
          legend: {
            data: ['期望','实际库存']
          },
          //x轴
          xAxis: {
            data: ["周一", "周二", "周三", "周四", "周五", "周六","周日"],
            boundaryGap:false
          },
          //y轴 一般不需要写数据
          yAxis: {
            name:this.yTittle,
          },

          //系列 (图例和系列是配套的)
          series: [
            {
              name: '期望',//和图例对应的
              type: 'line',//柱状图 决定了图的样子 是柱状图还是线状图还是饼状图
              data: expectedData
            },
            {
              name: '实际库存',
              type: 'line',//折线图
              data: actualData
            },
            
          ]
        }
      )
    }
  },
  watch:{
    chartData:{
      deep:true,
      handler(newVal){
        this.setOption(newVal)
      }
    }
  }

}
</script>

<style>

</style>