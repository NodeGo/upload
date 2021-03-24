import React, { useState, useRef } from 'react'
import axios from 'axios'
import style from './style.css'
import { notification, Tooltip } from 'antd'
import { PictureOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}
export const NewUploadFile = props => {
    const {
        onEnter = () => {
            return true
        },
        onLeave = () => {
            return true
        },
        onError = () => {
            return true
        },
        url,
        maxSize = 9000,
        suffixs = [],
        //文件
        multiple = true,
        maxLength = 99,
        //最大文件数
        cq = 2
        //并发数
    } = props

    const [files, setFiles] = useState([])
    const inputRef = useRef(null)
    let queue = []
    // 需要上传的队列
    let uploadQueue = []
    // 正在上传的队列, 无论上传成功还是上传失败都不会从该队列移除, 避免死循环
    let uploadingQueue = []

    const handleDrag = event => {
        event.preventDefault()
        event.stopPropagation()
    }
    const hanldeDragStart = event => {
        event.preventDefault()
        event.stopPropagation()
    }
    const handleDragOver = event => {
        event.preventDefault()
        event.stopPropagation()
    }
    const handleDragEnter = event => {
        event.preventDefault()
        event.stopPropagation()
    }
    const handleDragLeave = event => {
        event.preventDefault()
        event.stopPropagation()
    }
    const handleDragEnd = event => {
        event.preventDefault()
        event.stopPropagation()
    }
    const handleDrop = event => {
        event.preventDefault()
        event.stopPropagation()
        let filesTransfer = event.dataTransfer.files
        if (files.length + filesTransfer.length > maxLength) {
            notification.error({ message: `超过最大上传文件数` })
            return
        }
        for (let i = 0; i < filesTransfer.length; i++) {
            const errMsg = check(filesTransfer[i])
            if (errMsg) {
                notification.error({ message: errMsg })
            } else {
                filesTransfer[i].guid = guid()
                addQueue(filesTransfer[i])
            }
        }
    }

    const handleFileChange = event => {
        console.log(event)
        console.log(inputRef)
        event.preventDefault()
        event.stopPropagation()
        let filesCurrent = inputRef.current.files
        if (files.length + filesCurrent.length > maxLength) {
            notification.error({ message: `超过最大上传文件数` })
            return
        }
        for (let i = 0; i < filesCurrent.length; i++) {
            const errMsg = check(filesCurrent[i])
            if (errMsg) {
                notification.error({ message: errMsg })
            } else {
                filesCurrent[i].guid = guid()
                addQueue(filesCurrent[i])
            }
        }
    }
    const sumbit = async () => {
        for (let i = 0; i < uploadQueue.length; i++) {
            // 避免重复的上传
            let current = uploadQueue[i]
            let guids = uploadingQueue.map(f => f.guid)
            if (guids.indexOf(current.guid) < 0) {
                uploadingQueue = [...uploadingQueue, current]
                let uploadFile = new FormData()
                uploadFile.append('file', current)
                try {
                    let _ = await axios.post(url, uploadFile)
                    if (_.data.code !== 1000) {
                        current.success = false
                        notification.error({ message: `${current.name}, 上传失败` })
                        onError(_)
                    } else {
                        current.success = true
                        notification.success({ message: `${current.name}, 上传成功` })
                        onLeave(_)
                    }
                    current.repo = _.data
                    setFiles(files => [...files, current])
                    uploadQueue = uploadQueue.filter(f => f.guid !== current.guid)
                    processQueue()
                    return
                } catch (_) {
                    current.success = false
                    current.repo = _
                    setFiles(files => [...files, current])
                    notification.error({ message: `${current.name}, 上传失败` })
                    onError(_)
                    uploadQueue = uploadQueue.filter(f => f.guid !== current.guid)
                    processQueue()
                }
            }
        }
    }
    const addQueue = file => {
        queue = [...queue, file]
        processQueue()
    }

    const processQueue = () => {
        if (uploadQueue.length < cq && queue.length > 0) {
            let uploadFile = queue.shift()
            if (onEnter(uploadFile)) {
                uploadQueue = [...uploadQueue, uploadFile]
                sumbit()
            }
        }
    }

    const check = file => {
        if (file.size > maxSize * 1024) return `${file.name}超过文件大小限制`
        if (suffixs && suffixs.length && suffixs.indexOf(getSuffixName(file.name)) < 0)
            return `${file.name}文件格式不支持`
        return undefined
    }

    const getSuffixName = name => {
        let names = name.split('.')
        return names[names.length - 1]
    }

    const handleCloseClick = guid => {
        setFiles(files => files.filter(f => f.guid !== guid))
    }
    return (
        <div className={style.wrapper}>
            <div>
                <form
                    method='post'
                    action=''
                    encType='multipart/form-data'
                    onDrag={handleDrag}
                    onDragStart={hanldeDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}>
                    <input
                        ref={inputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        type='file'
                        id='file'
                        multiple={multiple}
                    />
                   
                    <label className={style.content} htmlFor='file'>
                    <div className='upload-drag upload'>
                        <PictureOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                        <p className='upload-text'>
                            <strong>选择文件</strong>
                            <span>或拖拽文件到这里</span>
                        </p>
                        </div>
                    </label>
                    
                </form>
            </div>
            {/* 上传列表 */}
            <div className='upload-list'>
                {files.map(file => {
                    return (
                        <div key={file.guid} className='upload-item'>
                            {file.success ? (
                                <CheckCircleOutlined className={file.success ? '' : 'error'} />
                            ) : (
                                <Tooltip autoAdjustOverflow title={file.repo.message}>
                                    <ExclamationCircleOutlined style={{ fontSize: '20px' }} className='error' />
                                </Tooltip>
                            )}
                            <div className={`left ${file.success ? '' : 'error'}`}>{file.name}</div>
                            {/* <div className={`right ${file.success ? '' : 'error'}`}>
                                <CloseCircleOutlined onClick={handleCloseClick.bind(this, file.guid)} />   
                            </div> */}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
