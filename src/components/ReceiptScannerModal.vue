<template>
  <div class="modal-backdrop">
    <div class="modal-content glass-panel animate-slide-up">
      
      <div class="modal-header flex justify-between items-center mb-4">
        <h3 class="m-0 text-lg font-bold">Scanning Receipt</h3>
        <button v-if="!scanning" @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div class="scanner-body">
        <!-- Image Preview Container -->
        <div class="image-container" :class="{ 'scanning-active': scanning }">
          <img v-if="imageUrl" :src="imageUrl" alt="Struk Preview" class="receipt-preview" />
          
          <!-- Laser Scan Effect -->
          <div v-if="scanning" class="laser-scanner"></div>
          
          <!-- Success Overlay -->
          <div v-if="success" class="success-overlay animate-fade-in">
            <div class="checkmark-circle">
              <svg viewBox="0 0 24 24" class="checkmark-icon" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
            <p class="success-text mt-2 font-bold text-primary">Sukses!</p>
          </div>
        </div>

        <!-- Status Text -->
        <div class="status-indicator mt-4 text-center">
          <p v-if="success" class="text-primary font-semibold">Berhasil mengekstrak data!</p>
          <p v-else-if="errorMsg" class="text-expense font-semibold">{{ errorMsg }}</p>
          <div v-else-if="scanning" class="scanning-text">
            <span class="pulsing-dot"></span>
            Gambar sedang dianalisis, tunggu sebentar...
          </div>
          <p v-else class="text-muted">Menyiapkan gambar...</p>
        </div>
      </div>

      <div class="modal-footer mt-6 flex justify-end" v-if="!scanning && !success">
        <button @click="$emit('close')" class="btn btn-secondary w-full">Batalkan</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { scanReceipt } from '../gemini'

const props = defineProps({
  file: {
    type: File,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const imageUrl = ref(null)
const scanning = ref(true)
const success = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  // 1. Create preview URL
  imageUrl.value = URL.createObjectURL(props.file)

  // 2. Start Scanning Process
  try {
    const aiResult = await scanReceipt(props.file)
    
    // 3. Handle Success
    scanning.value = false
    success.value = true
    
    // Wait for 1.5 seconds to show the success animation before closing
    setTimeout(() => {
      emit('success', aiResult)
    }, 1500)

  } catch (error) {
    scanning.value = false
    errorMsg.value = error.message || "Gagal memindai struk."
  }
})

onUnmounted(() => {
  // Cleanup preview URL to prevent memory leaks
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.btn-close:hover {
  color: var(--text-main);
}

.image-container {
  position: relative;
  width: 100%;
  height: 300px;
  background-color: var(--bg-body);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed var(--border);
}

.receipt-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Laser Scanner Animation */
.laser-scanner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--primary);
  box-shadow: 0 0 10px 2px var(--primary-light), 0 0 20px 5px var(--primary);
  animation: scan-laser 2s ease-in-out infinite alternate;
  z-index: 10;
}

@keyframes scan-laser {
  0% { top: 0; }
  100% { top: calc(100% - 4px); }
}

.scanning-active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(10, 191, 83, 0.1) 0%, transparent 100%);
  animation: scan-glow 2s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes scan-glow {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* Success Animation */
.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.checkmark-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.checkmark-icon {
  width: 32px;
  height: 32px;
  color: white;
  animation: drawCheck 0.5s ease-out 0.3s forwards;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

/* Text Status */
.scanning-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  font-weight: 500;
}

.pulsing-dot {
  width: 8px;
  height: 8px;
  background-color: var(--primary);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(10, 191, 83, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(10, 191, 83, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(10, 191, 83, 0); }
}
</style>
