# Current Affairs Database Setup

## 1. Create the current_affairs table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE current_affairs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  importance TEXT NOT NULL DEFAULT 'Medium',
  tags TEXT[] DEFAULT '{}',
  bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_current_affairs_date ON current_affairs(date);
CREATE INDEX idx_current_affairs_category ON current_affairs(category);
CREATE INDEX idx_current_affairs_importance ON current_affairs(importance);
CREATE INDEX idx_current_affairs_date_category ON current_affairs(date, category);

-- Enable Row Level Security (RLS)
ALTER TABLE current_affairs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now)
-- In production, you should restrict this based on user roles
CREATE POLICY "Allow all operations" ON current_affairs FOR ALL USING (true);
```

## 2. Sample Data

You can insert sample data using this SQL:

```sql
INSERT INTO current_affairs (title, summary, category, date, source, source_url, importance, tags) VALUES
(
  'Chandrayaan-3 Successfully Lands on Moon South Pole',
  'India becomes the first country to successfully land a spacecraft on the Moon south pole, marking a historic achievement in space exploration.',
  'Science & Technology',
  '2024-08-23',
  'ISRO',
  'https://www.isro.gov.in/chandrayaan3',
  'High',
  ARRAY['Space', 'Moon Mission', 'ISRO', 'Technology']
),
(
  'G20 Summit 2024: India Presidency and Key Outcomes',
  'India successfully hosted the G20 Summit with focus on digital transformation, climate action, and inclusive growth.',
  'International Relations',
  '2024-09-15',
  'Ministry of External Affairs',
  'https://www.mea.gov.in/g20-summit-2024',
  'High',
  ARRAY['G20', 'Diplomacy', 'International Relations', 'India']
),
(
  'New Education Policy 2024: Implementation Updates',
  'Government announces progress on NEP implementation including digital education infrastructure and skill development programs.',
  'Education',
  '2024-10-05',
  'Ministry of Education',
  'https://www.education.gov.in/nep-2024',
  'High',
  ARRAY['Education', 'NEP', 'Policy', 'Digital Learning']
),
(
  'Climate Change: India Net Zero Commitments',
  'India reaffirms commitment to achieve net zero emissions by 2070 with new renewable energy targets and green hydrogen mission.',
  'Environment',
  '2024-10-12',
  'Ministry of Environment',
  'https://www.moef.gov.in/climate-change',
  'High',
  ARRAY['Climate Change', 'Net Zero', 'Renewable Energy', 'Environment']
),
(
  'Digital India: UPI Goes Global',
  'UPI payment system expands to multiple countries, promoting digital payments and financial inclusion globally.',
  'Economy',
  '2024-10-18',
  'RBI',
  'https://www.rbi.org.in/upi-global',
  'Medium',
  ARRAY['UPI', 'Digital Payments', 'Economy', 'Technology']
);
```

## 3. Features

Once set up, you can:

1. **Add Current Affairs**: Use the form to add new entries
2. **Edit Entries**: Click "Edit" to modify existing entries
3. **Delete Entries**: Remove entries with confirmation
4. **Manage Categories**: Choose from predefined categories
5. **Set Importance**: Mark entries as High, Medium, or Low priority
6. **Add Tags**: Use comma-separated tags for better organization

## 4. Categories Available

- Science & Technology
- International Relations
- Economy
- Environment
- Health
- Education
- Agriculture
- Defense
- Infrastructure
- Sports
- Politics
- Society
- Culture
- Geography
- History

## 5. Access

- **Admin Panel**: Navigate to `/admin/current-affairs`
- **Public View**: Navigate to `/current-affairs`
- **Navigation**: Available in the hamburger menu under "Admin"

## 6. Data Structure

Each current affairs entry contains:
- **Title**: Headline of the news
- **Summary**: Brief description (2-3 sentences)
- **Category**: Subject area classification
- **Date**: When the event occurred
- **Source**: Official source (e.g., PIB, Ministry, Newspaper)
- **Importance**: Priority level (High/Medium/Low)
- **Tags**: Array of relevant keywords
- **Timestamps**: Created and updated timestamps 