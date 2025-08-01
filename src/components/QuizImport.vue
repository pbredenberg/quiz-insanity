<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-white mb-4">Import Quiz</h2>

      <!-- File Upload Section -->
      <div class="space-y-4">
        <div class="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
          <input 
            type="file" 
            ref="fileInput"
            accept=".json"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <button 
            @click="selectFile"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Select JSON File
          </button>
          
          <p class="mt-2 text-gray-400">
            Or drag and drop a JSON file here
          </p>
        </div>

        <!-- File Info Section -->
        <div v-if="selectedFile" class="bg-gray-700 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-white">Selected File</h3>
            <button 
              @click="clearFile"
              class="text-red-400 hover:text-red-300"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p class="text-gray-300">
            <span class="font-medium">Name:</span> {{ selectedFile.name }}
          </p>
          <p class="text-gray-300">
            <span class="font-medium">Size:</span> {{ fileSize }}
          </p>
        </div>

        <!-- Preview Section -->
        <div v-if="previewQuiz" class="bg-gray-700 rounded-lg p-4 mt-4">
          <h3 class="text-white mb-2">Quiz Preview</h3>
          <p class="text-gray-300">
            <span class="font-medium">Title:</span> {{ previewQuiz.title }}
          </p>
          <p class="text-gray-300">
            <span class="font-medium">Questions:</span> {{ previewQuiz.questions.length }}
          </p>
        </div>

        <!-- Import Button -->
        <div v-if="previewQuiz" class="mt-4">
          <button 
            @click="importQuiz"
            :disabled="isImporting || !canImport"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            <svg 
              v-if="isImporting"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-if="isImporting">Importing...</span>
            <span v-else>Import Quiz</span>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-md">
          <p class="text-red-400">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="importSuccess" class="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-md">
          <p class="text-green-400">Quiz imported successfully!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ApiService } from '../services/api';
import { useQuizzesStore } from '../stores/quizzes';
import type { Quiz } from '../types';

const quizzesStore = useQuizzesStore();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const fileContent = ref<string | null>(null);
const previewQuiz = ref<Quiz | null>(null);
const error = ref<string | null>(null);
const isImporting = ref(false);
const importSuccess = ref(false);

const fileSize = computed(() => {
  const file = selectedFile.value;
  if (!file) return '';
  const size = file.size;
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

const canImport = computed(() => {
  return previewQuiz.value !== null && !error.value;
});

const selectFile = () => {
  fileInput.value?.click();
};

const clearFile = () => {
  selectedFile.value = null;
  fileContent.value = null;
  previewQuiz.value = null;
  error.value = null;
  importSuccess.value = false;
  const input = fileInput.value;
  if (input) {
    input.value = '';
  }
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  if (!file.name.toLowerCase().endsWith('.json')) {
    error.value = 'Only JSON files are supported';
    return;
  }
  
  selectedFile.value = file;
  
  try {
    const content = await file.text();
    fileContent.value = content;
    
    // Validate quiz data
    const validation = ApiService.validateAndImportQuiz(content);
    
    if (validation.success) {
      previewQuiz.value = validation.quiz;
      error.value = null;
    } else {
      error.value = validation.error || 'Invalid quiz format';
      previewQuiz.value = null;
    }
  } catch (err) {
    error.value = 'Failed to read file';
    previewQuiz.value = null;
  }
};

const importQuiz = async () => {
  if (!fileContent.value) return;
  
  isImporting.value = true;
  error.value = null;
  
  try {
    // Import quiz using API service
    const result = await ApiService.importQuiz(fileContent.value);
    
    if (result.success && result.quiz) {
      // Add quiz to store
      quizzesStore.addQuiz(result.quiz);
      importSuccess.value = true;
      clearFile();
    } else {
      error.value = result.error || 'Failed to import quiz';
    }
  } catch (err) {
    error.value = 'Failed to import quiz. Please try again.';
  } finally {
    isImporting.value = false;
  }
};
</script>
