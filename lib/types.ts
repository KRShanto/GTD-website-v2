// Database types based on our Supabase schema
export interface TeamMember {
  id: number;
  created_at: string;
  name: string;
  title: string;
  bio: string;
  image_url: string;
  slug: string;
}

export interface GalleryImage {
  id: number;
  created_at: string;
  image_url: string;
  alt: string;
}

export interface GalleryVideo {
  id: number;
  created_at: string;
  video_url: string;
  alt: string;
  thumbnail_url: string | null;
}

export interface Testimonial {
  id: number;
  created_at: string;
  name: string;
  address: string;
  company: string;
  content: string;
  rating: number;
}

export interface Author {
  id: number;
  created_at: string;
  name: string;
  email: string | null;
  avatar_url: string;
}
