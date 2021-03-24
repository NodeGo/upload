<!--
 * @Date: 2021-03-24 17:18:33
 * @LastEditors: pdshwc
 * @LastEditTime: 2021-03-24 17:30:04
-->
 const {
        onEnter = () => {
            return true
        },
        文件上传前 false 拦截
        onLeave = () => {
            return true
        },
         文件成功
        onError = () => {
            return true
        },
        文件失败
        url,
        上传地址
        maxSize = 9000,
        suffixs = [],
        文件类型校验
        multiple = true,
        //多选
        maxLength = 99,
        最大文件数
        cq = 2
        并发数
    } = props
    