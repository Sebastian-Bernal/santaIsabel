export const useTheme = () => {
  const theme = useState<'light' | 'dark'>('theme', () => 'light')

  const apply = (t: 'light' | 'dark') => {
    theme.value = t
    if (process.client) {
      const root = document.documentElement
      root.classList.toggle('dark', t === 'dark')
      localStorage.setItem('theme', t)
    }
  }

  const toggle = () => apply(theme.value === 'dark' ? 'light' : 'dark')

  onMounted(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    apply(saved ?? (prefersDark ? 'dark' : 'light'))
  })

  return { theme, toggle, apply }
}
