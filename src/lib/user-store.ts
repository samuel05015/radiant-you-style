import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createProfile, getProfile, updateProfile, incrementGlowDays, incrementCheckIns, incrementLooksCreated } from './database';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  gender?: "masculino" | "feminino";
  faceShape?: "oval" | "redondo" | "quadrado" | "coração" | "alongado";
  skinTone?: "primavera" | "verão" | "outono" | "inverno";
  photoUrl?: string;
  analysisConfidence?: number;
  joinedDate: string;
  stats: {
    glowDays: number;
    checkIns: number;
    looksCreated: number;
  };
}

interface UserStore {
  profile: UserProfile | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile) => Promise<void>;
  loadProfile: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateStats: (stats: Partial<UserProfile['stats']>) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      
      setProfile: async (profile) => {
        set({ isLoading: true });
        
        try {
          // Tentar criar perfil no Supabase
          const dbProfile = await createProfile({
            email: profile.email,
            name: profile.name,
            face_shape: profile.faceShape || null,
            skin_tone: profile.skinTone || null,
            photo_url: profile.photoUrl || null,
            analysis_confidence: profile.analysisConfidence || null,
            glow_days: profile.stats.glowDays || 0,
            check_ins: profile.stats.checkIns || 0,
            looks_created: profile.stats.looksCreated || 0,
          });

          if (dbProfile) {
            set({ 
              profile: {
                ...profile,
                id: dbProfile.id,
                stats: {
                  glowDays: dbProfile.glow_days,
                  checkIns: dbProfile.check_ins,
                  looksCreated: dbProfile.looks_created,
                }
              }
            });
          } else {
            // Fallback para armazenamento local
            set({ profile });
          }
        } catch (error) {
          console.error('Error creating profile in Supabase:', error);
          // Fallback para armazenamento local
          set({ profile });
        } finally {
          set({ isLoading: false });
        }
      },

      loadProfile: async (email) => {
        set({ isLoading: true });
        
        try {
          const dbProfile = await getProfile(email);
          
          if (dbProfile) {
            set({
              profile: {
                id: dbProfile.id,
                email: dbProfile.email,
                name: dbProfile.name,
                faceShape: dbProfile.face_shape as any,
                skinTone: dbProfile.skin_tone as any,
                photoUrl: dbProfile.photo_url || undefined,
                analysisConfidence: dbProfile.analysis_confidence || undefined,
                joinedDate: dbProfile.created_at,
                stats: {
                  glowDays: dbProfile.glow_days,
                  checkIns: dbProfile.check_ins,
                  looksCreated: dbProfile.looks_created,
                }
              }
            });
          }
        } catch (error) {
          console.error('Error loading profile from Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        const currentProfile = get().profile;
        if (!currentProfile) return;

        set({ isLoading: true });

        try {
          // Atualizar no Supabase
          const dbUpdates: any = {};
          if (updates.name) dbUpdates.name = updates.name;
          if (updates.faceShape) dbUpdates.face_shape = updates.faceShape;
          if (updates.skinTone) dbUpdates.skin_tone = updates.skinTone;
          if (updates.photoUrl) dbUpdates.photo_url = updates.photoUrl;
          if (updates.analysisConfidence) dbUpdates.analysis_confidence = updates.analysisConfidence;

          const updated = await updateProfile(currentProfile.email, dbUpdates);
          
          if (updated) {
            set({
              profile: {
                ...currentProfile,
                ...updates,
              }
            });
          } else {
            // Fallback para armazenamento local
            set({
              profile: currentProfile ? { ...currentProfile, ...updates } : null,
            });
          }
        } catch (error) {
          console.error('Error updating profile in Supabase:', error);
          // Fallback para armazenamento local
          set({
            profile: currentProfile ? { ...currentProfile, ...updates } : null,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      updateStats: async (stats) => {
        const currentProfile = get().profile;
        if (!currentProfile) return;

        const newStats = { ...currentProfile.stats, ...stats };

        try {
          // Incrementar no Supabase
          if (stats.glowDays !== undefined && stats.glowDays > currentProfile.stats.glowDays) {
            await incrementGlowDays(currentProfile.email);
          }
          if (stats.checkIns !== undefined && stats.checkIns > currentProfile.stats.checkIns) {
            await incrementCheckIns(currentProfile.email);
          }
          if (stats.looksCreated !== undefined && stats.looksCreated > currentProfile.stats.looksCreated) {
            await incrementLooksCreated(currentProfile.email);
          }

          set({
            profile: {
              ...currentProfile,
              stats: newStats,
            },
          });
        } catch (error) {
          console.error('Error updating stats in Supabase:', error);
          // Fallback para armazenamento local
          set({
            profile: {
              ...currentProfile,
              stats: newStats,
            },
          });
        }
      },

      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'glow-user-profile',
    }
  )
);
