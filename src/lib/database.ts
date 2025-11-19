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

export async function getFavoriteOutfits(profileId: string): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('profile_id', profileId)
    .eq('favorite', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorite outfits:', error);
    return [];
  }

  return data || [];
}

export async function toggleOutfitFavorite(outfitId: string, favorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('outfits')
    .update({ favorite })
    .eq('id', outfitId);

  if (error) {
    console.error('Error toggling outfit favorite:', error);
  }
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
