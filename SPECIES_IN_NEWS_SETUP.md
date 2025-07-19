# Species in News - UPSC Preparation Feature

## Overview

The "Species in News" feature is designed to help UPSC aspirants track and study important wildlife species that frequently appear in current affairs and exam questions. Each species card displays comprehensive information including conservation statuses, threats, and recent news.

## Features

### 1. Species Display Page (`/species-in-news`)
- **Card-based Layout**: Beautiful cards displaying species information
- **Search Functionality**: Search by species name, scientific name, or common name
- **Status Filtering**: Filter by IUCN, CITES, or Wildlife Protection Act status
- **Color-coded Status Badges**: Visual indicators for different conservation levels
- **Responsive Design**: Works on desktop and mobile devices

### 2. Species Management Page (`/admin/species`)
- **Add New Species**: Complete form with all required fields
- **Edit Existing Species**: Modify any species information
- **Delete Species**: Remove species from the database
- **Bulk Data Management**: Efficient table view for managing multiple species

## Database Schema

### Table: `species_in_news`

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `name` | VARCHAR(255) | Common name of the species |
| `scientific_name` | VARCHAR(255) | Scientific/Latin name |
| `common_name` | VARCHAR(255) | Alternative common names |
| `iucn_status` | VARCHAR(50) | IUCN Red List status |
| `cites_status` | VARCHAR(50) | CITES Appendix status |
| `wpa_status` | VARCHAR(50) | Wildlife Protection Act Schedule |
| `habitat` | TEXT | Natural habitat description |
| `distribution` | TEXT | Geographical distribution |
| `threats` | TEXT[] | Array of threats to the species |
| `conservation_efforts` | TEXT[] | Array of conservation measures |
| `recent_news` | TEXT | Recent news or developments |
| `image_url` | TEXT | URL to species image |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

## Conservation Statuses

### IUCN Red List Categories
- **Extinct (EX)**: No known living individuals
- **Extinct in the Wild (EW)**: Only survives in cultivation/captivity
- **Critically Endangered (CR)**: Extremely high risk of extinction
- **Endangered (EN)**: High risk of extinction
- **Vulnerable (VU)**: High risk of endangerment
- **Near Threatened (NT)**: Close to qualifying for threatened status
- **Least Concern (LC)**: Lowest risk, widespread and abundant
- **Data Deficient (DD)**: Insufficient data for assessment
- **Not Evaluated (NE)**: Not yet assessed

### CITES Appendices
- **Appendix I**: Species threatened with extinction (strictest protection)
- **Appendix II**: Species not necessarily threatened but require regulation
- **Appendix III**: Species protected in at least one country
- **Not Listed**: No CITES protection

### Wildlife Protection Act (WPA) Schedules
- **Schedule I**: Highest protection (e.g., Tiger, Lion, Elephant)
- **Schedule II**: High protection (e.g., Rhesus Macaque)
- **Schedule III & IV**: Moderate protection
- **Schedule V**: Vermin (e.g., Common Crow, Fruit Bats)
- **Schedule VI**: Plant species protection
- **Not Listed**: No WPA protection

## Setup Instructions

### 1. Database Setup
Run the SQL script in `SPECIES_IN_NEWS_SETUP.sql` in your Supabase database:

```sql
-- Execute the entire SQL file in Supabase SQL Editor
-- This will create the table, indexes, policies, and sample data
```

### 2. Sample Data
The setup script includes 10 important UPSC species:
1. Bengal Tiger
2. Asiatic Lion
3. Indian Rhinoceros
4. Snow Leopard
5. Great Indian Bustard
6. Gangetic Dolphin
7. Hoolock Gibbon
8. Red Panda
9. Nilgiri Tahr
10. Lion-tailed Macaque

### 3. Row Level Security (RLS)
The table has RLS enabled with policies for authenticated users:
- Read access for all authenticated users
- Insert/Update/Delete access for authenticated users

## Usage Guide

### For Students (UPSC Aspirants)

1. **Browse Species**: Visit `/species-in-news` to view all species
2. **Search**: Use the search bar to find specific species
3. **Filter**: Use status filters to focus on specific conservation categories
4. **Study**: Each card contains comprehensive information for exam preparation

### For Administrators

1. **Add Species**: Visit `/admin/species` to add new species
2. **Update Information**: Edit existing species data
3. **Manage Content**: Keep species information current with latest news

## Important UPSC Topics Covered

### 1. Conservation Statuses
- Understanding IUCN Red List categories
- CITES international trade regulations
- Wildlife Protection Act of India, 1972

### 2. Conservation Projects
- Project Tiger
- Project Elephant
- Project Snow Leopard
- Project Great Indian Bustard
- Project Dolphin

### 3. Protected Areas
- National Parks
- Wildlife Sanctuaries
- Biosphere Reserves
- Tiger Reserves

### 4. Threats and Challenges
- Habitat loss and fragmentation
- Poaching and illegal trade
- Human-wildlife conflict
- Climate change impacts
- Infrastructure development

### 5. Conservation Strategies
- In-situ conservation
- Ex-situ conservation
- Community-based conservation
- International cooperation

## Color Coding System

### IUCN Status Colors
- **Red**: Critically Endangered, Endangered
- **Orange**: Vulnerable
- **Yellow**: Near Threatened
- **Green**: Least Concern
- **Gray**: Extinct, Data Deficient, Not Evaluated

### CITES Status Colors
- **Red**: Appendix I (highest protection)
- **Orange**: Appendix II
- **Yellow**: Appendix III
- **Gray**: Not Listed

### WPA Status Colors
- **Red**: Schedule I (highest protection)
- **Orange**: Schedule II
- **Yellow**: Schedule III, IV
- **Blue**: Schedule V, VI
- **Gray**: Not Listed

## Future Enhancements

1. **Image Gallery**: Multiple images per species
2. **News Integration**: Automatic news updates
3. **Quiz Feature**: Species-based practice questions
4. **Map Integration**: Interactive distribution maps
5. **Timeline**: Historical conservation milestones
6. **PDF Export**: Generate study materials
7. **Mobile App**: Native mobile application

## Technical Notes

- Built with React + TypeScript
- Uses Supabase for backend
- Responsive design with Tailwind CSS
- Real-time updates with Supabase subscriptions
- Optimized for performance with proper indexing

## Support

For technical support or feature requests, please contact the development team. 