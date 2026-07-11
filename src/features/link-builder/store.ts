import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LinkTreeConfig, Project, LinkItem, SocialItem, ThemeConfig, ProfileConfig } from './types'

interface LinkBuilderState {
  config: LinkTreeConfig
  projects: Project[]
  activeProjectId: string | null
  
  // Profile actions
  updateProfile: (profile: Partial<ProfileConfig>) => void
  
  // Link actions
  addLink: () => void
  updateLink: (id: string, updates: Partial<LinkItem>) => void
  removeLink: (id: string) => void
  reorderLinks: (index: number, direction: 'up' | 'down') => void
  
  // Social actions
  updateSocial: (platform: string, url: string, isEnabled: boolean) => void
  
  // Theme actions
  updateTheme: (themeUpdates: Partial<ThemeConfig>) => void
  
  // Project management actions
  saveProject: (name?: string) => string
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  createNewProject: (name: string) => void
  resetConfig: () => void
}

const DEFAULT_CONFIG: LinkTreeConfig = {
  profile: {
    name: 'Alex Rivera',
    bio: 'Senior UX Architect & Tech Writer | Crafting digital experiences ✨',
    avatarUrl: ''
  },
  links: [],
  socials: [],
  theme: {
    preset: 'custom',
    appTheme: 'system',
    appColorTheme: 'zinc'
  }
}

export const useLinkBuilderStore = create<LinkBuilderState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      projects: [],
      activeProjectId: null,

      updateProfile: (profileUpdates) =>
        set((state) => ({
          config: {
            ...state.config,
            profile: {
              ...state.config.profile,
              ...profileUpdates
            }
          }
        })),

      addLink: () =>
        set((state) => {
          const newLink: LinkItem = {
            id: `link-${Date.now()}`,
            title: 'New Social Link',
            url: 'https://',
            icon: 'Link2',
            isEnabled: true,
            animation: 'none'
          }
          return {
            config: {
              ...state.config,
              links: [...state.config.links, newLink]
            }
          }
        }),

      updateLink: (id, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            links: state.config.links.map((link) =>
              link.id === id ? { ...link, ...updates } : link
            )
          }
        })),

      removeLink: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            links: state.config.links.filter((link) => link.id !== id)
          }
        })),

      reorderLinks: (index, direction) =>
        set((state) => {
          const links = [...state.config.links]
          const targetIndex = direction === 'up' ? index - 1 : index + 1
          
          if (targetIndex < 0 || targetIndex >= links.length) {
            return {} // Out of bounds
          }
          
          // Swap links
          const temp = links[index]
          links[index] = links[targetIndex]
          links[targetIndex] = temp
          
          return {
            config: {
              ...state.config,
              links
            }
          }
        }),

      updateSocial: (platform, url, isEnabled) =>
        set((state) => {
          const platformExists = state.config.socials.some((s) => s.platform === platform)
          let socials = []
          
          if (platformExists) {
            socials = state.config.socials.map((s) =>
              s.platform === platform ? { ...s, url, isEnabled } : s
            )
          } else {
            socials = [...state.config.socials, { platform, url, isEnabled }]
          }
          
          return {
            config: {
              ...state.config,
              socials
            }
          }
        }),

      updateTheme: (themeUpdates) =>
        set((state) => ({
          config: {
            ...state.config,
            theme: {
              ...state.config.theme,
              ...themeUpdates
            }
          }
        })),

      saveProject: (name) => {
        const state = get()
        const projectId = state.activeProjectId || `proj-${Date.now()}`
        const projectName = name || (state.activeProjectId 
          ? state.projects.find((p) => p.id === state.activeProjectId)?.name || 'My Link Tree'
          : 'My Link Tree')
          
        const updatedProject: Project = {
          id: projectId,
          name: projectName,
          updatedAt: new Date().toISOString(),
          config: state.config
        }
        
        const projectIndex = state.projects.findIndex((p) => p.id === projectId)
        let updatedProjects = [...state.projects]
        
        if (projectIndex >= 0) {
          updatedProjects[projectIndex] = updatedProject
        } else {
          updatedProjects.push(updatedProject)
        }
        
        set({
          projects: updatedProjects,
          activeProjectId: projectId
        })
        
        return projectId
      },

      loadProject: (id) => {
        const state = get()
        const project = state.projects.find((p) => p.id === id)
        if (project) {
          set({
            config: project.config,
            activeProjectId: id
          })
        }
      },

      deleteProject: (id) =>
        set((state) => {
          const updatedProjects = state.projects.filter((p) => p.id !== id)
          const wasActive = state.activeProjectId === id
          return {
            projects: updatedProjects,
            activeProjectId: wasActive ? null : state.activeProjectId,
            config: wasActive ? DEFAULT_CONFIG : state.config
          }
        }),

      createNewProject: (name) => {
        const id = `proj-${Date.now()}`
        const newProject: Project = {
          id,
          name,
          updatedAt: new Date().toISOString(),
          config: DEFAULT_CONFIG
        }
        
        set((state) => ({
          projects: [...state.projects, newProject],
          config: DEFAULT_CONFIG,
          activeProjectId: id
        }))
      },

      resetConfig: () =>
        set({
          config: DEFAULT_CONFIG,
          activeProjectId: null
        })
    }),
    {
      name: 'link-builder-workspace'
    }
  )
)
