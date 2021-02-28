//这是attr的接口请求函数
import request from '@/utils/request'

export default {
    // GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
    // 根据选中的id获取属性
    getList(category1Id,category2Id,category3Id){
        return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
    },

    // DELETE /admin/product/deleteAttr/{attrId}
    // 删除某个属性
    deleteAttr(attrId){
        return request.delete(`/admin/product/deleteAttr/${attrId}`)
    },

    // POST /admin/product/saveAttrInfo
    // 增加或修改属性
    addOrUpdate(attr){
        return request.post('/admin/product/saveAttrInfo',attr)
    }
}