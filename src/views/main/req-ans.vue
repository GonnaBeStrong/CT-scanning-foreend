<template>
  <div class="chat-container">
    <div class="messages">
      <!-- 动态渲染消息 -->
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <div :class="{'user-message': msg.type === 'user', 'bot-message': msg.type === 'bot'}">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="输入消息并按 Enter 发送..."
      />
      <button @click="sendMessage">发送</button>

    </div>
  </div>
  <button @click="comment(1)" class="bottonClassA">很有帮助</button>
  <button @click="comment(2)" class="bottonClassB">还可以</button>
  <button @click="comment(3)" class="bottonClassC">一般般</button>
  <button @click="comment(4)" class="bottonClassD">很差劲</button>
  <button @click="readText" class="bottonClassE">朗读</button>
  <button @click="stopReading" class="bottonClassF">停止</button>
  <select v-model="selectedVoice" class="bottonClassG">
      <option v-for="(voice,index) in voices"  :key="index" :value="voice">{{ voice.name }} ({{ voice.lang }})</option>
    </select>
</template>

<script >
import {ref, defineComponent, onMounted} from 'vue';
import axios from "axios";

export default defineComponent({
  setup(){
    // 消息数据
const messages = ref([
  { text: '智能肿瘤医疗问答系统是专为肿瘤患者及家属打造的专业医疗咨询平台，致力于通过人工智能技术为您提供全面、精准的医疗信息服务。在这个充满挑战的抗癌道路上，我们深知每一分可靠的信息支持都至关重要。本系统由资深医疗AI团队联合国内三甲医院肿瘤科专家共同研发，集成了自然语言处理、医学知识图谱和循证医学数据库等前沿技术，能够7×24小时为您解答各类肿瘤相关问题。无论是早期症状的自我评估、检查报告的解读分析，还是手术、化疗、放疗、靶向治疗等不同治疗方案的比较选择，系统都能基于最新临床指南和医学文献提供专业建议。我们特别关注患者的个性化需求，针对药物副作用管理、营养支持、疼痛控制、心理调适等康复环节提供细致指导。所有回答均经过严格医学审核，确保信息准确可靠，同时我们郑重声明：AI生成内容仅供辅助参考，不能替代专业医生的诊断和治疗方案。', type: 'bot' }, // 机器人消息
]);

// 输入框的内容
const newMessage = ref('');

// 发送消息方法
const sendMessage = () => {
  if (newMessage.value.trim()) {
    // 添加用户消息
    messages.value.push({ text: newMessage.value, type: 'user' });
    const userMessage = newMessage.value;
    newMessage.value = ''; // 清空输入框
    messages.value.push({ text: '请等候我的回答！', type: 'bot' });

    axios.post("http://localhost:8000/process_message",{content : userMessage}).then((response) => {
        const data = response.data;
        if(data){
            const reply = data.content;
            messages.value.push({ text: reply, type: 'bot' });
            textToRead.value = reply;
            readText();
        }
    })
  }
};

let ws = null;

const  connectWebSocket = () =>{
      ws = new WebSocket("ws://localhost:8000/ws/audio");

      ws.onopen = () => {
        console.log("WebSocket connected!");
      };

      ws.onmessage = (event) => {
        console.log("Message from server:", event.data);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
      };
    };


let mediaRecorder = null;
let audioChunks;
const startRecording = () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            const reader = new FileReader();

            reader.onloadend = () => {
              if (ws && ws.readyState === WebSocket.OPEN) {
                // 发送音频数据到 WebSocket
                ws.send(reader.result);
              }
            };

            reader.readAsArrayBuffer(audioBlob);
          };

          mediaRecorder.start(100); // 每100ms发送一次音频数据
          // connectWebSocket();
        })
        .catch((err) => {
          console.error("Error accessing media devices.", err);
        });
    };

const comment = (param)=>{
  axios.get("http://localhost:8000/comment",{
    params:{
      commentType: param,
    }
  })
}

// 停止录音
const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };

const textToRead = ref('这是默认朗读内容，请修改为你需要的文本');
const isSpeaking = ref(false);
const voices = ref([]);
const selectedVoice = ref(null);

const readText = () => {
  if ('speechSynthesis' in window) {
    console.log(textToRead.value);
    const utterance = new SpeechSynthesisUtterance(textToRead.value);

    if (selectedVoice.value) {
      utterance.voice = selectedVoice.value;
    }

    utterance.onend = () => isSpeaking.value = false;
    isSpeaking.value = true;

    window.speechSynthesis.speak(utterance);
  } else {
    alert('浏览器不支持文本朗读');
  }
};

const stopReading = () => {
  window.speechSynthesis.cancel();
  isSpeaking.value = false;
};


onMounted(()=>{
  // 某些浏览器需要先触发一次speech才能获取voices
  window.speechSynthesis.onvoiceschanged = () => {
    voices.value = window.speechSynthesis.getVoices();
  };
  // 立即尝试获取
  voices.value = window.speechSynthesis.getVoices();
  selectedVoice.value = voices.value[1];
  const chineseVoice = voices.value.find(v => v.lang.includes('zh'));
    if (chineseVoice) {
      selectedVoice.value = chineseVoice;
      console.log("有中文语言")
    }
  console.log(voices.value);
  connectWebSocket();
})

return{
  newMessage,
  sendMessage,
  messages,
  stopRecording,
  startRecording,
  comment,
  readText,
  stopReading,
}
  }
})

</script>

<style scoped>
.chat-container {
  position: absolute;
  right: 10%;
  width: 1000px;
  height: 690px;
  border: 1px solid #ddd;
  border-radius: 8px;
  border-color: #4c93af;
  border-width: 10px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #f9f9f9;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
}

.user-message {
  background-color: #e1f7d5;
  padding: 8px;
  border-radius: 8px;
  max-width: 70%;
  align-self: flex-end;
  word-wrap: break-word;
}

.bot-message {
  background-color: #f0f0f0;
  padding: 8px;
  border-radius: 8px;
  max-width: 70%;
  align-self: flex-start;
  word-wrap: break-word;
}

.input-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input {
  width: 75%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  width: 20%;
  padding: 8px;
  border: none;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.bottonClassA {
  position: absolute;
  right: 5%;
  width: 50px;
  top: 20%
}
.bottonClassB {
  position: absolute;
  right: 5%;
  width: 50px;
  top: 30%
}
.bottonClassC {
  position: absolute;
  right: 5%;
  width: 50px;
  top: 40%
}
.bottonClassD {
  position: absolute;
  right: 5%;
  width: 50px;
  top: 50%
}
.bottonClassE {
  position: absolute;
  right: 5%;
  width: 50px;
  top: 60%
}
.bottonClassF {
  position: absolute;
  right: 5%;
  width: 50px;
  top: 70%
}
.bottonClassG {
  position: absolute;
  right: 5%;
  width: 50px;
  top: 80%
}
</style>
