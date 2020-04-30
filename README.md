# client

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration

### 流程
#### 前端
- 将文件按照固定的大小切片
- 为每个文件块添加文件名以及哈希值
- 使用异步并发将文件块发送
- 全部发送完毕之后发送合并请求
#### 后端
- 拿到每个块中的文件名以及哈希值
- 设置`chunk`路径，将接收到的文件块放到该路径中
- 将文件块按照`hash`进行排序，使用管道将每个文件块中的流读到写入流中
- 删除块文件夹

See [Configuration Reference](https://cli.vuejs.org/config/).
