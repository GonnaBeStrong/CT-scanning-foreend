<template>
  <div >
    <p>
    <a-upload
    v-model:file-list="fileList"
    name="file"
    :headers="headers"
    :before-upload="beforeUpload"
    @change="handleChange"
    :show-upload-list="false"
    >
    <a-button>
      <upload-outlined></upload-outlined>
      Click to Upload
    </a-button>
  </a-upload>
  </p>
   <img :src="imageUrl" alt="Processed Image" class="image-size" />
  <div class="right-div">
      <div class="analyse">
      <a-card title="分析结果" :bordered="false" style="width: 300px; background-color:lightblue"  >
      <p>检测置信度:{{ CONFIDENCE }}</p>
      <p>肿瘤类型:{{ CLASS_ID }}</p>
      </a-card>
      </div>
  </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import {notification} from "ant-design-vue";
import axios from "axios";

// 上传相关状态
const fileList = ref([])
const imageUrl = ref();
const CLASS_ID = ref();
const CONFIDENCE = ref("");
const headers = {
  authorization: 'Bearer your-token-if-needed'
}

// WebSocket 实例
let socket = null
// const receivedImage = ref(null)

// 建立 WebSocket 连接
onMounted(() => {
  socket = new WebSocket('ws://localhost:8000/test-tumor') // 替换为你的后端地址

  socket.onopen = () => {
    console.log('WebSocket连接已建立')
  }

  socket.onmessage = (event) => {
    if (typeof event.data === 'string') {

        // 这是 detection_info_json
        const detectionInfo = JSON.parse(event.data);
        console.log(detectionInfo);

        if (detectionInfo.length > 0) {

          const { confidence, class_id } = detectionInfo[0];

          CONFIDENCE.value = (confidence*100).toFixed(2) + "%";
          if(class_id == 0){
            CLASS_ID.value = "神经胶质瘤";
          }
          else if(class_id == 1){
            CLASS_ID.value = "脑膜瘤";
          }
          else if(class_id == 2){
            CLASS_ID.value = "正常";
          }
          else if(class_id == 3){
            CLASS_ID.value = "垂体腺瘤";
          }
          else{
            CLASS_ID.value = "未知";
            CONFIDENCE.value = "未知";
          }
          console.log("种类",CLASS_ID.value);
          console.log("置信度",confidence.value);
        }
        else{
            if(detectionInfo.status == 401){
              notification.error({ description: "文件格式不对，请传入图片" });
              setTimeout(() => {
              window.location.reload(); // 刷新页面
              }, 1000);
            }

        }
      }
        // 处理返回的图片数据
        const arrayBuffer = event.data;
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        imageUrl.value = url;  // 更新图片显示
  }

  socket.onerror = (error) => {
    console.error('WebSocket错误:', error)
  }

  socket.onclose = () => {
    console.log('WebSocket连接已关闭')
  }
})

// addCTRecords((param)=>{
//   axios.get("")
// })

onBeforeUnmount(() => {
  if (socket) {
    socket.close()
  }
})

// 文件上传之前，将文件转为 base64 并通过 WebSocket 发送
const beforeUpload = (file) => {
  const reader = new FileReader()
  reader.onload = () => {
    const base64Data = reader.result.split(',')[1] // 包含 data:image/jpeg;base64,... 的字符串
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(base64Data)
    } else {
      console.warn('WebSocket 未连接')
    }
  }
  reader.readAsDataURL(file)

  return false // 阻止默认上传行为
}
// 文件状态变更时触发（你也可以加 loading 等）
const handleChange = info => {
  console.log('上传文件变化', info)
}
</script>

<style>
.image-size {
  position: absolute;
  width: 500px;  /* 设置宽度 */
  height: 500px; /* 设置高度 */
  right: 45%;
  top: 20%;
  border: 5px solid #000; /* 设置边框宽度、颜色和样式 */
  border-radius: 10px;     /* 添加圆角 */
  padding: 5px;            /* 图片与边框之间的间距 */
  background-color:lightblue;

}

.right-div {
  position: absolute;        /* 使用绝对定位 */
  right: 10%;              /* 距离右边框 100px */
  top: 60%;                  /* 垂直方向设置为 50%（垂直居中） */
  transform: translateY(-50%); /* 通过 transform 来垂直居中 */
  width: 450px;              /* 设置固定宽度 */
  height: 450px;
}

.analyse {
      border: 5px solid #000; /* 设置边框宽度、颜色和样式 */
      border-radius: 10px;     /* 添加圆角 */
      background-color:lightblue;
      padding: 30px;
}

</style>
