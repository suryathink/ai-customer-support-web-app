import { axiosClient } from './axiosClient'
import type { ApiResponse, LoginPayload, SignupPayload, User } from '@/types'

export const authApi = {
  async signup(payload: SignupPayload) {
    const { data } = await axiosClient.post<ApiResponse<User>>('/auth/signup', payload)
    return data.data
  },

  async login(payload: LoginPayload) {
    const { data } = await axiosClient.post<ApiResponse<User>>('/auth/login', payload)
    return data.data
  },

  async logout() {
    await axiosClient.post('/auth/logout')
  },

  async me() {
    const { data } = await axiosClient.get<ApiResponse<User>>('/auth/me')
    return data.data
  },
}
