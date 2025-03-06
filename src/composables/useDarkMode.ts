import { ref, onMounted, onUnmounted } from 'vue';

export function useDarkMode() {
  const darkMode = ref(false);
  
  const updateDarkMode = (e: MediaQueryListEvent | MediaQueryList) => {
    darkMode.value = e.matches;
  };
  
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
  };
  
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    updateDarkMode(mediaQuery);
    mediaQuery.addEventListener('change', updateDarkMode);
    
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updateDarkMode);
    });
  });
  
  return {
    darkMode,
    toggleDarkMode
  };
}
