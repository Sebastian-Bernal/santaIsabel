<template>
    <div class="w-full min-h-[calc(100%-40px)] rounded-[8px_8px_8px_0] scrollForm overflow-y-auto bg-gray-50 text-black dark:bg-gray-900 dark:text-white md:py-8 py-4 md:px-12 md:pl-15 px-4">
        <slot></slot>
    </div>
</template>

<style>
/* Custom scrollbar */
:deep(.scrollForm::-webkit-scrollbar) {
  width: 8px;
}

:deep(.scrollForm::-webkit-scrollbar-track) {
  background: #f1f1f1;
  /* background: #1f2937; */
  border-radius: 4px;
}

:deep(.scrollForm::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 4px;
}

:deep(.scrollForm::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :deep(.scrollForm::-webkit-scrollbar-track) {
    background: #1f2937;
  }
  :deep(.scrollForm::-webkit-scrollbar-thumb) {
    background: #4b5563;
  }
  :deep(.scrollForm::-webkit-scrollbar-thumb:hover) {
    background: #6b7280;
  }
}

/* Animación suave de entrada */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(> *) {
  animation: slideInUp 0.3s ease-out;
}
</style>