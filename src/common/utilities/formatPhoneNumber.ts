const phoneNumberFormatFn = (phoneNumberString: string, pattern?: '000-000-0000' | '(000) 000-0000'): string | null => {
  const cleaned = `${phoneNumberString}`?.replace(/\D/g, '')
  const Regex = /^(1|)?(\d{3})(\d{3})(\d{4})$/
  const match = Regex.exec(cleaned)
  if (match) {
    const intlCode: string = match[1] ? '+1 ' : ''
    if (pattern && pattern === '000-000-0000') return [intlCode, match[2], '-', match[3], '-', match[4]].join('')
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return null
}

export default phoneNumberFormatFn
