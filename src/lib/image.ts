export function imageSrc(value?: string) {
  if (!value) return undefined
  return value.startsWith('data/') ? `${import.meta.env.BASE_URL}${value}` : value
}
