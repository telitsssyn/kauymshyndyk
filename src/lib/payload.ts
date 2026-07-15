import config from '@payload-config'
import { getPayload } from 'payload'

// getPayload кэширует экземпляр между вызовами сам
export const getPayloadClient = () => getPayload({ config })
