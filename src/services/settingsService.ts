import { supabase } from "../lib/supabaseClient";

export async function getStudioSettings() {
  const { data, error } = await supabase
    .from("studio_settings")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudioSettings(settings: any) {
  const { data, error } = await supabase
    .from("studio_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settings.id);
  if (error) throw error;
  return data;
}
