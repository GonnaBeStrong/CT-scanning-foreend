<template>
  <div>
    <input type="date" v-model="selectedDate" @change="fetchImages">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="(img, index) in images" :key="index" class="image-container">
        <img :src="img" :alt="'Image ' + index" class="preview-image">
      </div>
      <p v-if="images.length === 0">当日没有记录</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const images = ref([]);
const loading = ref(false);

const fetchImages = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:8000/images', {
      params: { date: selectedDate.value }
    });
    images.value = response.data.images;
  } catch (error) {
    console.error('Error fetching images:', error);
    images.value = [];
  } finally {
    loading.value = false;
  }
};
// 初始加载当天的图片
fetchImages();
</script>

<style>
.preview-image {
  max-width: 300px;
  max-height: 300px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.image-container {
  display: inline-block;
}
</style>