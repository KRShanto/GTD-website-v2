# Authors Database Schema

Simple schema for blog authors management in GTD Media Production.

## Table: authors

### Columns
- `id` (int8) - Primary key
- `created_at` (timestampz) - Creation timestamp  
- `name` (text) - Author's full name
- `email` (text) - Author's email address (optional)
- `avatar_url` (text) - Author's avatar image URL

### SQL Schema

```sql
-- Create authors table
CREATE TABLE authors (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NULL,
  avatar_url TEXT NOT NULL
);

-- Create index for better performance
CREATE INDEX idx_authors_email ON authors(email);

-- Add email constraint (only if email is provided)
ALTER TABLE authors ADD CONSTRAINT authors_email_check 
  CHECK (email IS NULL OR email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');
```

## Usage

Authors are simple CRUD entities that will be referenced by blog posts. They are not connected to authentication - they're just data records for attribution. No dedicated author pages needed.

### Example Data

```sql
INSERT INTO authors (name, email, avatar_url) VALUES 
('Ashraful Alam', 'ashraful@gtdmedia.com', '/team/ashraful.jpg'),
('Fatema Akter Jumki', 'fatema@gtdmedia.com', '/team/fatema.jpg'),
('Mohammad Khaled Shams', NULL, '/team/khaled.jpg');
``` 