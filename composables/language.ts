export function useLanguage() {
  const { language } = useNavigatorLanguage()
  const languages = usePreferredLanguages()
  const shortLanguages = computed(() => languages.value.map(value => value.split('-').at(0)).filter((value, index, self) => self.indexOf(value) === index))
  const shortLanguage = computed(() => language.value?.split('-').at(0))
  const short = computed(() => shortLanguages.value.at(0) ?? shortLanguage.value)
  return { short }
}
