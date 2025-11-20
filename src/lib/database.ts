import { supabase } from './supabase';
import type { Database } from './supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type SkincareRoutine = Database['public']['Tables']['skincare_routines']['Row'];
type SkincareRoutineInsert = Database['public']['Tables']['skincare_routines']['Insert'];

type HairCheckIn = Database['public']['Tables']['hair_check_ins']['Row'];
type HairCheckInInsert = Database['public']['Tables']['hair_check_ins']['Insert'];

type Outfit = Database['public']['Tables']['outfits']['Row'];
type OutfitInsert = Database['public']['Tables']['outfits']['Insert'];

type ClosetItem = Database['public']['Tables']['closet_items']['Row'];
type ClosetItemInsert = Database['public']['Tables']['closet_items']['Insert'];

// Profile Operations
export async function createProfile(profile: ProfileInsert): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
}

export async function getProfile(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(email: string, updates: ProfileUpdate): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

export async function incrementGlowDays(email: string): Promise<void> {
  const profile = await getProfile(email);
  if (profile) {
    await updateProfile(email, { glow_days: (profile.glow_days || 0) + 1 });
  }
}

export async function incrementCheckIns(email: string): Promise<void> {
  const profile = await getProfile(email);
  if (profile) {
    await updateProfile(email, { check_ins: (profile.check_ins || 0) + 1 });
  }
}

export async function incrementLooksCreated(email: string): Promise<void> {
  const profile = await getProfile(email);
  if (profile) {
    await updateProfile(email, { looks_created: (profile.looks_created || 0) + 1 });
  }
}

// Skincare Routines
export async function saveSkincareRoutine(routine: SkincareRoutineInsert): Promise<SkincareRoutine | null> {
  const { data, error } = await supabase
    .from('skincare_routines')
    .insert(routine)
    .select()
    .single();

  if (error) {
    console.error('Error saving skincare routine:', error);
    return null;
  }

  return data;
}

export async function getSkincareRoutines(profileId: string, limit: number = 7): Promise<SkincareRoutine[]> {
  const { data, error } = await supabase
    .from('skincare_routines')
    .select('*')
    .eq('profile_id', profileId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching skincare routines:', error);
    return [];
  }

  return data || [];
}

export async function getTodaySkincareRoutine(profileId: string): Promise<SkincareRoutine | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('skincare_routines')
    .select('*')
    .eq('profile_id', profileId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching today skincare routine:', error);
  }

  return data || null;
}

// Hair Check-ins
export async function saveHairCheckIn(checkIn: HairCheckInInsert): Promise<HairCheckIn | null> {
  const { data, error } = await supabase
    .from('hair_check_ins')
    .insert(checkIn)
    .select()
    .single();

  if (error) {
    console.error('Error saving hair check-in:', error);
    return null;
  }

  return data;
}

export async function getHairCheckIns(profileId: string, limit: number = 30): Promise<HairCheckIn[]> {
  const { data, error } = await supabase
    .from('hair_check_ins')
    .select('*')
    .eq('profile_id', profileId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching hair check-ins:', error);
    return [];
  }

  return data || [];
}

// Haircut Recommendations
export async function saveHaircutRecommendation(data: {
  user_email: string;
  face_shape: string;
  cut_name: string;
  description: string;
  why_it_works: string;
  styling_tips: string;
  image_url: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('haircut_recommendations')
    .insert({
      user_email: data.user_email,
      face_shape: data.face_shape,
      cut_name: data.cut_name,
      description: data.description,
      why_it_works: data.why_it_works,
      styling_tips: data.styling_tips,
      image_url: data.image_url,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving haircut recommendation:', error);
    return false;
  }

  return true;
}

export async function getHaircutRecommendations(userEmail: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('haircut_recommendations')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching haircut recommendations:', error);
    return [];
  }

  return data || [];
}

// Outfits
export async function saveOutfit(outfit: OutfitInsert): Promise<Outfit | null> {
  const { data, error } = await supabase
    .from('outfits')
    .insert(outfit)
    .select()
    .single();

  if (error) {
    console.error('Error saving outfit:', error);
    return null;
  }

  return data;
}

export async function getOutfits(profileId: string): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching outfits:', error);
    return [];
  }

  return data || [];
}

// Closet Items
export async function saveClosetItem(item: ClosetItemInsert): Promise<ClosetItem | null> {
  const { data, error } = await supabase
    .from('closet_items')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Error saving closet item:', error);
    return null;
  }

  return data;
}

export async function getClosetItems(userEmail: string): Promise<ClosetItem[]> {
  // Primeiro, buscar o profile_id usando o email
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (profileError || !profileData) {
    console.error('Error fetching profile:', profileError);
    return [];
  }

  const { data, error } = await supabase
    .from('closet_items')
    .select('*')
    .eq('profile_id', profileData.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching closet items:', error);
    return [];
  }

  return data || [];
}

export async function getClosetItemsByCategory(profileId: string, category: string): Promise<ClosetItem[]> {
  const { data, error } = await supabase
    .from('closet_items')
    .select('*')
    .eq('profile_id', profileId)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching closet items by category:', error);
    return [];
  }

  return data || [];
}

export async function deleteClosetItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('closet_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting closet item:', error);
    return false;
  }

  return true;
}

// Upload de imagens (Storage)
export async function uploadImage(file: File, path: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ========================================
// MELHORIAS: Novas funções
// ========================================

// 1. FAVORITOS
export async function toggleOutfitFavorite(outfitId: string, isFavorite: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('outfits')
    .update({ is_favorite: isFavorite })
    .eq('id', outfitId);

  if (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }

  return true;
}

export async function getFavoriteOutfits(profileId: string): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('profile_id', profileId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data || [];
}

// 2. HISTÓRICO DE ANÁLISES
export async function saveAnalysisHistory(data: {
  profile_id: string;
  analysis_type: 'face' | 'skin' | 'hair';
  photo_url?: string;
  result_data: any;
}): Promise<boolean> {
  const { error } = await supabase
    .from('analysis_history')
    .insert({
      profile_id: data.profile_id,
      analysis_type: data.analysis_type,
      photo_url: data.photo_url,
      result_data: data.result_data
    });

  if (error) {
    console.error('Error saving analysis history:', error);
    return false;
  }

  return true;
}

export async function getAnalysisHistory(profileId: string, type?: string, limit: number = 10) {
  let query = supabase
    .from('analysis_history')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq('analysis_type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching analysis history:', error);
    return [];
  }

  return data || [];
}

// 3. ESTATÍSTICAS DE USO
export async function recordOutfitUsage(outfitId: string, profileId: string): Promise<boolean> {
  const { error } = await supabase
    .from('outfit_usage')
    .insert({
      outfit_id: outfitId,
      profile_id: profileId
    });

  if (error) {
    console.error('Error recording outfit usage:', error);
    return false;
  }

  return true;
}

export async function getOutfitStats(profileId: string) {
  const { data, error } = await supabase
    .from('outfit_stats')
    .select('*')
    .eq('profile_id', profileId)
    .order('usage_count', { ascending: false });

  if (error) {
    console.error('Error fetching outfit stats:', error);
    return [];
  }

  return data || [];
}

export async function getMostUsedOutfits(profileId: string, limit: number = 5) {
  const { data, error } = await supabase
    .from('outfit_stats')
    .select('*')
    .eq('profile_id', profileId)
    .order('usage_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching most used outfits:', error);
    return [];
  }

  return data || [];
}

// 4. PLANEJADOR SEMANAL
export async function saveWeeklyPlanner(data: {
  profile_id: string;
  outfit_id?: string;
  date: string; // YYYY-MM-DD
  day_of_week: number;
  notes?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('weekly_planner')
    .upsert({
      profile_id: data.profile_id,
      outfit_id: data.outfit_id,
      date: data.date,
      day_of_week: data.day_of_week,
      notes: data.notes
    }, {
      onConflict: 'profile_id,date'
    });

  if (error) {
    console.error('Error saving weekly planner:', error);
    return false;
  }

  return true;
}

export async function getWeeklyPlanner(profileId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('weekly_planner')
    .select(`
      *,
      outfits (*)
    `)
    .eq('profile_id', profileId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching weekly planner:', error);
    return [];
  }

  return data || [];
}

export async function deleteWeeklyPlanner(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('weekly_planner')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting planner entry:', error);
    return false;
  }

  return true;
}

// 5. LEMBRETES/NOTIFICAÇÕES
export async function saveReminder(data: {
  profile_id: string;
  reminder_type: string;
  title: string;
  message: string;
  scheduled_time?: string;
  is_active?: boolean;
}): Promise<boolean> {
  const { error } = await supabase
    .from('reminders')
    .insert(data);

  if (error) {
    console.error('Error saving reminder:', error);
    return false;
  }

  return true;
}

export async function getReminders(profileId: string, activeOnly: boolean = true) {
  let query = supabase
    .from('reminders')
    .select('*')
    .eq('profile_id', profileId);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }

  return data || [];
}

export async function toggleReminder(id: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('reminders')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    console.error('Error toggling reminder:', error);
    return false;
  }

  return true;
}

export async function deleteReminder(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting reminder:', error);
    return false;
  }

  return true;
}
