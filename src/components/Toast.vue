<!-- src/components/Toast.vue -->
<template>
  <div v-if="message" class="toast" :class="toastClass">
    <div class="toast-message">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
})

const toastClass = ref('')

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    toastClass.value = 'show'
    setTimeout(() => {
      toastClass.value = 'hide'
    }, 3000) // 自动消失，3秒
  }
})
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border-radius: 5px;
  opacity: 0;
  transition: opacity 0.5s;
  z-index: 1000;
}

.toast.show {
  opacity: 1;
}

.toast.hide {
  opacity: 0;
}

.toast-message {
  font-size: 14px;
  text-align: center;
}
</style>
