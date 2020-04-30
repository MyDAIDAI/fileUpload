/* eslint-disable */
<template>
  <div id="app">
    <input type="file" @change="handleFileChange" />
    <el-button @click="handleUpload">点击上传</el-button>
  </div>
</template>

<script>
import request from './request';

const SIZE = 10 * 1024 * 1024;

export default {
  name: 'App',
  data() {
    return {
      container: {
        file: null,
      },
      dataList: [],
    };
  },
  methods: {
    handleFileChange(event) {
      console.log('event', event);
      const [file] = event.target.files;
      if (!file) return;
      this.container.file = file;
    },
    handleUpload() {
      if (!this.container.file) return;
      // 将文件进行切块
      const fileChunkList = this.createFileChunk(this.container.file);
      // 设置文件hash值
      this.dataList = fileChunkList.map((chunk, index) => (
        {
          chunk,
          hash: `${this.container.file.name}-${index}`,
        }));
      // 异步上传 chunks
      this.uploadFileChunks();
    },
    createFileChunk(file, size = SIZE) {
      let chunk = 0;
      const fileList = [];
      while (chunk < file.size) {
        fileList.push(file.slice(chunk, chunk + size));
        chunk += SIZE;
      }
      return fileList;
    },
    async uploadFileChunks() {
      const requestList = this.dataList.map(({ chunk, hash }) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('hash', hash);
        formData.append('filename', this.container.file.name);
        return { formData };
      }).map(async ({ formData }) => {
        await request({
          url: 'http://localhost:3000',
          data: formData,
        });
      });
      await Promise.all(requestList);
      await this.sendMergeRequest();
    },
    async sendMergeRequest() {
      await request({
        url: 'http://localhost:3000/merge',
        headers: {
          "content-type": "application/json"
        },
        data: JSON.stringify({
          filename: this.container.file.name,
          size: SIZE
        })
      })
    }
  },
};
</script>

<style>
</style>
