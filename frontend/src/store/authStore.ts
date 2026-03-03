import { create } from 'zustand'

interface ModulePermissionInfo {
  module: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

interface PermissionGroupInfo {
  id: number
  name: string
  module_permissions: ModulePermissionInfo[]
}

interface User {
  id: number
  username: string
  email: string
  role: string
  first_name: string
  last_name: string
  phone?: string
  department?: { id: number; name: string } | null
  avatar?: string | null
  permission_group?: number | null
  permission_group_detail?: PermissionGroupInfo | null
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
  hasPermission: (module: string, action: 'can_view' | 'can_create' | 'can_edit' | 'can_delete') => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false })
  },
  hasPermission: (module, action) => {
    const state = get()
    if (!state.user) return false
    if (state.user.role === 'superadmin') return true
    const perms = state.user.permission_group_detail?.module_permissions
    if (!perms || perms.length === 0) return true // no group assigned → full access by default
    const mp = perms.find(p => p.module === module)
    return mp ? mp[action] : false
  },
}))
