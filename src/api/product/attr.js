//这个文件是和品牌相关的接口请求函数
import request from '@/utils/request'

export default {
    //根据选中的id获取属性
    getList(category1Id,category2Id,category3Id){
        return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
    },
    //删除某个属性
    //DELETE /admin/product/deleteAttr/{attrId}
    deleteAttr(attrId){
        return request.delete(`/admin/product/deleteAttr/${attrId}`)
    },
    //增加或修改属性
    addOrUpdate(attr){
        return request.post('/admin/product/saveAttrInfo',attr)
    }
}