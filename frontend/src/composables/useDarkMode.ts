import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  function setDark(dark: boolean) {
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('darkMode', String(dark))
  }

  function toggle() {
    setDark(!isDark.value)
  }

  onMounted(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      setDark(true)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDark(prefersDark)
    }
  })

  watch(isDark, (val) => {
    document.documentElement.classList.toggle('dark', val)
  })

  return { isDark, toggle }
}
