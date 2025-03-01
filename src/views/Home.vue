<template>
    <!-- <div class="home-page" :style="{ backgroundImage: \`url('${backgroundImage}')\` }"> -->
    <div class="home-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">

      <div class="welcome">
        <h1>欢迎来到辩论赛管理系统</h1>
        <p>这里可以查看赛程、投票支持队伍，并由管理员管理比赛结果。</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const images = [
    'https://picsum.photos/1200/800?image=1043',
    'https://picsum.photos/1200/800?image=1084',
    'https://picsum.photos/1200/800?image=1050'
  ];
  const backgroundImage = ref(images[0]);
  
  onMounted(() => {
    const idx = Math.floor(Math.random() * images.length);
    backgroundImage.value = images[idx];
  });
  </script>
  
  <style scoped>
  .home-page {
    width: 100%;
    height: calc(100vh - 64px);
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .welcome {
    background: rgba(0,0,0,0.5);
    padding: 40px;
    border-radius: 8px;
    text-align: center;
  }
  .welcome h1 {
    color: #fff;
    margin-bottom: 1em;
  }
  .welcome p {
    color: #f0f0f0;
    font-size: 1.2em;
  }
  </style>
  