# Database Schema

Based on the Supabase database screenshot, here are the table structures:

## Tables

### team
- `id` (int8) - Primary key
- `created_at` (timestampz) - Creation timestamp
- `name` (text) - Team member name
- `title` (text) - Job title/position
- `bio` (text) - Biography/description
- `image_url` (text) - Profile image URL
- `slug` (text) - URL slug for team member

### gallery-images
- `id` (int8) - Primary key
- `created_at` (timestampz) - Creation timestamp
- `image_url` (text) - Image URL
- `alt` (text) - Alt text for accessibility

### gallery-videos
- `id` (int8) - Primary key
- `created_at` (timestampz) - Creation timestamp
- `video_url` (text) - Video URL
- `alt` (text) - Alt text for accessibility

### testimonials
- `id` (int8) - Primary key
- `created_at` (timestampz) - Creation timestamp
- `name` (text) - Client name
- `role` (text) - Client role/position
- `company` (text) - Client company
- `content` (text) - Testimonial content
- `rating` (numeric) - Rating score

## Authentication
- Using Supabase Auth for admin authentication
- No registration, login only for existing admins 