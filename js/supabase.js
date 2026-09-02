const SUPABASE_URL = "https://jdwebyldtutljjzxkyxv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_w9fVax2GABMoPKXWhb3aZw_OqDOurMU";

export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function getCurrentSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) throw error;
  return data.session;
}

export async function loginWithPassword(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) throw error;
  return data.session;
}

export async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  return supabaseClient.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function fetchBucketListItems() {
  const { data, error } = await supabaseClient
    .from("bucket_items")
    .select("id, title, description, category_id, location_id, weather_id, completed, created_at, completed_at, completion_note, memory_photo_path, category:categories(id, name), location:locations(id, name), weather:weather_tags(id, name)")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const items = data ?? [];
  const photoPaths = items.map((item) => item.memory_photo_path).filter(Boolean);
  if (photoPaths.length === 0) return items;

  const { data: signedPhotos, error: photoError } = await supabaseClient.storage
    .from("bucket-memories")
    .createSignedUrls(photoPaths, 3600);
  if (photoError) throw photoError;

  const photoUrls = new Map(signedPhotos.map((photo) => [photo.path, photo.signedUrl]));
  return items.map((item) => ({
    ...item,
    memory_photo_url: photoUrls.get(item.memory_photo_path) ?? null,
  }));
}

export async function uploadMemoryPhoto(itemId, file) {
  const path = `${itemId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabaseClient.storage
    .from("bucket-memories")
    .upload(path, file, { contentType: "image/webp", cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

export async function removeMemoryPhoto(path) {
  if (!path) return;
  const { error } = await supabaseClient.storage.from("bucket-memories").remove([path]);
  if (error) throw error;
}

export async function createBucketListItem(item) {
  const { data, error } = await supabaseClient
    .from("bucket_items")
    .insert({
      title: item.title,
      description: item.description || null,
      category_id: item.categoryId || null,
      location_id: item.locationId || null,
      weather_id: item.weatherId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBucketListItem(id, changes) {
  const { data, error } = await supabaseClient
    .from("bucket_items")
    .update(changes)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBucketListItem(id) {
  const { error } = await supabaseClient
    .from("bucket_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function fetchCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("id, name, created_at")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(name) {
  const { data, error } = await supabaseClient
    .from("categories")
    .insert({ name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, name) {
  const { data, error } = await supabaseClient
    .from("categories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabaseClient.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchTagOptions(table) {
  const { data, error } = await supabaseClient.from(table).select("id, name, created_at").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createTagOption(table, name) {
  const { data, error } = await supabaseClient.from(table).insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function updateTagOption(table, id, name) {
  const { data, error } = await supabaseClient.from(table).update({ name }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTagOption(table, id) {
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if (error) throw error;
}
