import { z } from 'zod'

export const citySchema = z.enum([
  '台北市',
  '新北市',
  '桃園市',
  '台中市',
  '台南市',
  '高雄市',
])

export const citySelectorConfigSchema = z.object({})
