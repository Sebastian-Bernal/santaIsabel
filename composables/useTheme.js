export const useTheme = () => {
  const colorMode = useColorMode()

  const apply = (t) => {
    colorMode.preference = t
  }

  const toggle = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  return { theme: colorMode, toggle, apply }
}