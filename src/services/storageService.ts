import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type StorageBucket = 'avatars' | 'products' | 'covers';

/**
 * Converts a Base64 Data URL to a standard binary Blob / File object
 */
export function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string; extension: string } {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([uint8Array], { type: mimeType });
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';

  return { blob, mimeType, extension };
}

/**
 * Ensures required Supabase storage buckets ('avatars', 'products', 'covers') exist and are public.
 * Tries checking and creating them directly via the Supabase Storage API.
 */
export async function ensureStorageBuckets(): Promise<{
  success: boolean;
  buckets: Record<string, boolean>;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      buckets: { avatars: false, products: false, covers: false },
      message: 'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const targetBuckets: StorageBucket[] = ['avatars', 'products', 'covers'];
  const status: Record<string, boolean> = {};

  for (const b of targetBuckets) {
    try {
      // 1. Check if bucket exists
      const { data: bucketData, error: getErr } = await supabase.storage.getBucket(b);
      if (!getErr && bucketData) {
        status[b] = true;
        continue;
      }

      // 2. Attempt creation if missing
      const { error: createErr } = await supabase.storage.createBucket(b, {
        public: true,
        fileSizeLimit: 15728640,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic'],
      });

      if (!createErr) {
        status[b] = true;
      } else {
        // Test if bucket is accessible via list
        const { error: listErr } = await supabase.storage.from(b).list('', { limit: 1 });
        status[b] = !listErr;
      }
    } catch {
      status[b] = false;
    }
  }

  const allReady = Object.values(status).every(Boolean);
  return {
    success: allReady,
    buckets: status,
    message: allReady 
      ? 'All Supabase storage buckets (avatars, products, covers) are active and ready.'
      : 'Storage buckets initialized. If any bucket requires manual creation, run the script in supabase/schema.sql.',
  };
}

/**
 * Checks connectivity and readiness of Supabase storage buckets
 */
export async function getStorageHealth(): Promise<{
  configured: boolean;
  buckets: { name: StorageBucket; ready: boolean; publicUrlSample?: string }[];
}> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      buckets: [
        { name: 'avatars', ready: false },
        { name: 'products', ready: false },
        { name: 'covers', ready: false },
      ],
    };
  }

  const results: { name: StorageBucket; ready: boolean; publicUrlSample?: string }[] = [];
  const targetBuckets: StorageBucket[] = ['avatars', 'products', 'covers'];

  for (const b of targetBuckets) {
    try {
      const { data: bucketInfo, error: bErr } = await supabase.storage.getBucket(b);
      const isReady = !bErr && !!bucketInfo;
      const { data: pubData } = supabase.storage.from(b).getPublicUrl('sample.jpg');
      results.push({
        name: b,
        ready: isReady,
        publicUrlSample: pubData?.publicUrl,
      });
    } catch {
      results.push({ name: b, ready: false });
    }
  }

  return {
    configured: true,
    buckets: results,
  };
}

/**
 * Uploads a file (File object, Blob, or base64 data URL) directly to Supabase Storage.
 * Automatically tries target bucket (e.g. 'avatars' for creator profile pictures, 'products' for garment photos, 'covers' for banners).
 * If bucket does not exist, automatically attempts bucket creation or falls back to public bucket or data URL.
 * Returns the permanent public CDN URL.
 */
export async function uploadImageToStorage(
  fileOrDataUrl: File | Blob | string,
  options: {
    bucket?: StorageBucket;
    folder?: string;
    fileNamePrefix?: string;
  } = {}
): Promise<string> {
  const bucket = options.bucket || 'avatars';
  const folder = options.folder ? options.folder.replace(/^\/+|\/+$/g, '') : '';
  const prefix = options.fileNamePrefix || 'upload';

  // If Supabase is not configured or offline, return dataUrl if string
  if (!isSupabaseConfigured()) {
    if (typeof fileOrDataUrl === 'string') {
      return fileOrDataUrl;
    }
    // Convert File/Blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl as Blob);
    });
  }

  try {
    let fileBlob: Blob;
    let fileExt = 'jpg';
    let contentType = 'image/jpeg';

    if (typeof fileOrDataUrl === 'string') {
      // If it's already an external HTTP/HTTPS URL, no upload required
      if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
        return fileOrDataUrl;
      }
      // Base64 data URL
      const { blob, mimeType, extension } = dataUrlToBlob(fileOrDataUrl);
      fileBlob = blob;
      fileExt = extension;
      contentType = mimeType;
    } else if (fileOrDataUrl instanceof File) {
      fileBlob = fileOrDataUrl;
      fileExt = fileOrDataUrl.name.split('.').pop() || 'jpg';
      contentType = fileOrDataUrl.type || 'image/jpeg';
    } else {
      fileBlob = fileOrDataUrl;
      contentType = fileOrDataUrl.type || 'image/jpeg';
      fileExt = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 9);
    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanPrefix}_${timestamp}_${randomHex}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // 1. Attempt upload to requested bucket
    let { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBlob, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    // If bucket was missing, attempt auto-creation and retry upload
    if (uploadError) {
      const errMsg = uploadError.message?.toLowerCase() || '';
      if (errMsg.includes('not found') || errMsg.includes('bucket') || (uploadError as any).statusCode === 404) {
        try {
          await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 15728640,
          });

          const retry = await supabase.storage.from(bucket).upload(filePath, fileBlob, {
            contentType,
            cacheControl: '3600',
            upsert: true,
          });
          uploadData = retry.data;
          uploadError = retry.error;
        } catch {
          // creation failed or disallowed, proceed to fallbacks
        }
      }
    }

    if (uploadError) {
      console.warn(`Storage upload to bucket "${bucket}" note:`, uploadError.message);

      // If bucket 'avatars' or 'products' isn't yet created in user's project,
      // try fallback bucket 'public' or 'images'
      const fallbackBuckets: StorageBucket[] = ['public' as any, 'images' as any];
      let fallbackSuccessUrl: string | null = null;

      for (const fb of fallbackBuckets) {
        if (fb === bucket) continue;
        try {
          const { error: fbErr } = await supabase.storage.from(fb).upload(filePath, fileBlob, {
            contentType,
            cacheControl: '3600',
            upsert: true,
          });
          if (!fbErr) {
            const { data: pubData } = supabase.storage.from(fb).getPublicUrl(filePath);
            fallbackSuccessUrl = pubData.publicUrl;
            break;
          }
        } catch {
          // ignore
        }
      }

      if (fallbackSuccessUrl) {
        return fallbackSuccessUrl;
      }

      // If user hasn't created the bucket in their Supabase dashboard yet,
      // return compressed base64 dataUrl so the profile / product save succeeds without failing the UI
      if (typeof fileOrDataUrl === 'string') {
        return fileOrDataUrl;
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(fileBlob);
      });
    }

    // 2. Retrieve public permanent CDN URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload to Supabase storage:', err);
    if (typeof fileOrDataUrl === 'string') {
      return fileOrDataUrl;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(fileOrDataUrl as Blob);
    });
  }
}

