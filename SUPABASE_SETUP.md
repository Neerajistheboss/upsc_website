# Supabase Setup for PDF URL Manager

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Database Schema

Create a table called `pyq_data` in your Supabase database with the following SQL:

```sql
CREATE TABLE pyq_data (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  paper TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  question_paper_url TEXT NOT NULL,
  answer_key_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pyq_data_year ON pyq_data(year);
CREATE INDEX idx_pyq_data_paper ON pyq_data(paper);
CREATE INDEX idx_py_data_year_paper ON pyq_data(year, paper);

-- Enable Row Level Security (RLS)
ALTER TABLE pyq_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now)
-- In production, you should restrict this based on user roles
CREATE POLICY "Allow all operations" ON pyq_data FOR ALL USING (true);
```

## 4. Sample Data

You can insert sample data using the Supabase dashboard or SQL:

```sql
INSERT INTO pyq_data (year, title, paper, status, question_paper_url, answer_key_url) VALUES
(2024, 'UPSC CSE PRE 2024', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP-CSP-24-GENERAL-STUDIES-PAPER-I-180624.pdf', 'https://upsc.gov.in/sites/default/files/AnsKey-CivilServicesPExam-2024-GeneralStudies-I-210525.pdf'),
(2024, 'UPSC CSE PRE 2024', 'CSAT', 'Available', 'https://upsc.gov.in/sites/default/files/QP-CSP-24-GENERAL-STUDIES-PAPER-II-180624.pdf', 'https://upsc.gov.in/sites/default/files/AnsKey-CivilServicesPExam-2024-GeneralStudies-II-210525.pdf'),
(2023, 'UPSC CSE PRE 2023', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP_CS_P_2023_English.pdf', 'https://upsc.gov.in/sites/default/files/CS_P_2023_English_AK.pdf'),
(2022, 'UPSC CSE PRE 2022', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP_CS_P_2022_English.pdf', 'https://upsc.gov.in/sites/default/files/CS_P_2022_English_AK.pdf'),
(2021, 'UPSC CSE PRE 2021', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP_CS_P_2021_English.pdf', 'https://upsc.gov.in/sites/default/files/CS_P_2021_English_AK.pdf'),
(2020, 'UPSC CSE PRE 2020', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP_CS_P_2020_English.pdf', 'https://upsc.gov.in/sites/default/files/CS_P_2020_English_AK.pdf'),
(2019, 'UPSC CSE PRE 2019', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP_CS_P_2019_English.pdf', 'https://upsc.gov.in/sites/default/files/CS_P_2019_English_AK.pdf'),
(2018, 'UPSC CSE PRE 2018', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP_CS_P_2018_English.pdf', 'https://upsc.gov.in/sites/default/files/CS_P_2018_English_AK.pdf'),
(2017, 'UPSC CSE PRE 2017', 'GS', 'Available', 'https://upsc.gov.in/sites/default/files/QP_CS_P_2017_English.pdf', 'https://upsc.gov.in/sites/default/files/CS_P_2017_English_AK.pdf');
```

## 5. Features

Once set up, you can:

1. **View PYQ Data**: All PYQ data is loaded from Supabase
2. **Add New Entries**: Use the PDF URL Manager at `/admin/pdf-urls`
3. **Edit Existing Entries**: Click the "Edit" button in the manager
4. **Delete Entries**: Click the "Delete" button in the manager
5. **View PDFs**: Question papers and answer keys are displayed using the URLs from Supabase

## 6. Security Notes

- The current setup allows all operations on the `pyq_data` table
- In production, you should implement proper authentication and authorization
- Consider adding user roles and restricting access to the admin panel
- Validate URLs before storing them in the database

## 7. Troubleshooting

- Make sure your environment variables are correctly set
- Check that the Supabase table exists and has the correct schema
- Verify that RLS policies are configured correctly
- Check the browser console for any CORS or authentication errors

## Daily Targets Table

Create a table called `daily_targets` to store each user's daily targets and their status.

**Columns:**
- id (bigint, primary key, auto-increment)
- user_id (uuid, foreign key to users)
- date (date)
- target (text)
- status (text, e.g., 'pending', 'achieved', 'failed')
- productivity_rating (integer, nullable, 1-5)
- created_at (timestamp, default now())
- updated_at (timestamp, default now())

**Example SQL:**
```sql
create table daily_targets (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  date date not null,
  target text not null,
  status text default 'pending',
  productivity_rating integer,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
``` 