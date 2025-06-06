// =============================================================================
// CONFIGURACIONES DE ENTORNO PARA APLICACIÓN PILATES
// =============================================================================

// packages/shared/src/config/environment.ts
export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey?: string;
    apiSecret?: string;
    uploadPreset: string;
  };
  app: {
    url: string;
    name: string;
    version: string;
  };
  features: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableOfflineMode: boolean;
    maxFileUploadSize: number;
  };
}

const createEnvironmentConfig = (): EnvironmentConfig => {
  // Validar variables de entorno requeridas
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno faltantes: ${missingVars.join(', ')}`
    );
  }

  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'pilates_uploads',
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      name: 'Silvia Fernandez Pilates Studio',
      version: process.env.npm_package_version || '1.0.0',
    },
    features: {
      enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
      enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE === 'true',
      maxFileUploadSize: parseInt(process.env.MAX_FILE_UPLOAD_SIZE || '5242880'), // 5MB default
    },
  };
};

export const env = createEnvironmentConfig();

// =============================================================================
// CONFIGURACIÓN DE SUPABASE CLIENT
// =============================================================================

// packages/shared/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/environment';
import type { Database } from '@/types/database';

// Cliente para uso en el frontend (browser/React Native)
export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Cliente con service role para uso en el backend/server-side
export const supabaseAdmin = env.supabase.serviceRoleKey
  ? createClient<Database>(
      env.supabase.url,
      env.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

// =============================================================================
// CONFIGURACIÓN DE CLOUDINARY
// =============================================================================

// packages/shared/src/lib/cloudinary.ts
import { env } from '@/config/environment';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'auto' | 'face' | 'center';
  radius?: number | 'max';
}

export class CloudinaryService {
  private static cloudName = env.cloudinary.cloudName;
  private static uploadPreset = env.cloudinary.uploadPreset;

  /**
   * Generar URL optimizada de imagen
   */
  static getOptimizedImageUrl(
    publicId: string,
    options: CloudinaryTransformOptions = {}
  ): string {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
      radius,
    } = options;

    const transformations = [
      `f_${format}`,
      `q_${quality}`,
    ];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    if (radius) transformations.push(`r_${radius}`);

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations.join(',')}/${publicId}`;
  }

  /**
   * Subir imagen a Cloudinary
   */
  static async uploadImage(
    file: File | Blob,
    folder: string = 'profiles'
  ): Promise<{
    publicId: string;
    secureUrl: string;
    width: number;
    height: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);
    
    // Agregar timestamp para evitar problemas de cache
    formData.append('timestamp', Date.now().toString());

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        width: data.width,
        height: data.height,
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Error al subir la imagen. Intenta nuevamente.');
    }
  }

  /**
   * Eliminar imagen de Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    if (!env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      throw new Error('Credenciales de Cloudinary no configuradas para eliminación');
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await this.generateSignature(publicId, timestamp);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', env.cloudinary.apiKey);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw new Error('Error al eliminar la imagen');
    }
  }

  private static async generateSignature(publicId: string, timestamp: number): Promise<string> {
    // Esta función requiere implementación en el backend por seguridad
    // No exponer el API secret en el frontend
    const response = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, timestamp }),
    });

    const data = await response.json();
    return data.signature;
  }
}

// Presets comunes para la aplicación
export const cloudinaryPresets = {
  avatar: (publicId: string) => 
    CloudinaryService.getOptimizedImageUrl(publicId, {
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'face',
      quality: 80,
      radius: 'max',
    }),
  
  thumbnail: (publicId: string) => 
    CloudinaryService.getOptimizedImageUrl(publicId, {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 70,
    }),
  
  fullSize: (publicId: string) => 
    CloudinaryService.getOptimizedImageUrl(publicId, {
      width: 1200,
      quality: 85,
      crop: 'fit',
    }),
  
  classImage: (publicId: string) => 
    CloudinaryService.getOptimizedImageUrl(publicId, {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 75,
    }),
};

// =============================================================================
// CONFIGURACIÓN DE TIPOS TYPESCRIPT
// =============================================================================

// packages/shared/src/types/config.ts
export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  features: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableOfflineMode: boolean;
  };
  limits: {
    maxFileUploadSize: number;
    maxClassesPerDay: number;
    maxBookingsPerUser: number;
  };
  ui: {
    defaultTheme: 'light' | 'dark';
    defaultLanguage: string;
    dateFormat: string;
    timeFormat: string;
  };
}

export const appConfig: AppConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  features: {
    enableNotifications: env.features.enableNotifications,
    enableAnalytics: env.features.enableAnalytics,
    enableOfflineMode: env.features.enableOfflineMode,
  },
  limits: {
    maxFileUploadSize: env.features.maxFileUploadSize,
    maxClassesPerDay: 10,
    maxBookingsPerUser: 5,
  },
  ui: {
    defaultTheme: 'light',
    defaultLanguage: 'es',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
  },
};

// =============================================================================
// VALIDACIÓN DE CONFIGURACIÓN
// =============================================================================

// packages/shared/src/utils/config-validator.ts
export function validateEnvironmentConfig(): void {
  const errors: string[] = [];

  // Validar URL de Supabase
  try {
    new URL(env.supabase.url);
  } catch {
    errors.push('NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida');
  }

  // Validar formato de anon key
  if (!env.supabase.anonKey.startsWith('eyJ')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no parece ser un JWT válido');
  }

  // Validar cloud name de Cloudinary
  if (!/^[a-zA-Z0-9_-]+$/.test(env.cloudinary.cloudName)) {
    errors.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME contiene caracteres no válidos');
  }

  if (errors.length > 0) {
    throw new Error(
      `Errores de configuración:\n${errors.map(e => `- ${e}`).join('\n')}`
    );
  }
}

// Validar configuración al importar
if (typeof window === 'undefined') {
  // Solo validar en el servidor para evitar errores en el cliente
  validateEnvironmentConfig();
}
