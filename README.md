# Металл Вектор - Company Analysis Platform

A minimalist company analysis platform built with Next.js, TypeScript, and Tailwind CSS, featuring a clean Apple/Jony Ive-inspired monochrome design.

## Design Philosophy

- **Pure Monochrome**: Only black, white, and gray tones
- **No Icons or Emojis**: Clean, text-only interface
- **San Francisco Font**: System font (-apple-system) for native feel
- **Minimalist**: Information is clear, not overloaded
- **Apple-Inspired**: Subtle animations, generous whitespace, refined typography

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Database**: Prisma + PostgreSQL
- **Authentication**: Custom JWT-based auth

## Project Structure

```
/app
  /globals.css           # Apple-style design system
  /layout.tsx            # Root layout with San Francisco font
  /page.tsx              # Landing page
  /login/page.tsx        # Authentication (login + register)
  /analysis/page.tsx     # Company analysis interface
  /report/[id]/page.tsx  # Individual report view
  /companies/            # Companies list and detail
  /pricing/page.tsx      # Pricing plans
  /profile/page.tsx      # User profile and settings
  /components/
    Navigation.tsx       # Shared navigation component
  /api/                  # API routes
```

## Design System

### Colors (Monochrome Only)
- White: `#ffffff`
- Gray Scale: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- Black: `#000000`

### Typography
- Font Family: SF Pro Display/Text via `-apple-system`
- Heading Weights: 500-600
- Body Weight: 400
- Letter Spacing: -0.02em to -0.03em for large text

### Spacing Scale
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px

### Border Radius
- Small: 4px
- Medium: 8px
- Large: 12px
- XL: 16px
- 2XL: 24px

### Transitions
- Fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)
- Base: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
- Slow: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

## Components

### Navigation
Sticky navigation with blur effect, consistent across all pages.

### Buttons
- Primary: Black background, white text
- Secondary: White background, black text, gray border
- Sizes: Small, Regular, Large

### Cards
White background, subtle border, hover animation (translateY + shadow)

### Forms
Clean inputs with focus states, no visual clutter

## Pages

### 1. Landing Page (`/`)
- Hero section with clear value proposition
- Feature grid (3 columns)
- "How It Works" section with numbered steps
- CTA sections
- Footer

### 2. Login Page (`/login`)
- Toggle between Sign In and Sign Up
- Minimalist form design
- Error handling with subtle notifications

### 3. Analysis Page (`/analysis`)
- Single input for company name
- Loading state with spinner
- Results displayed in clean cards
- Export functionality

### 4. Report Page (`/report/[id]`)
- Company name and date header
- Structured sections: Overview, Market Position, Competitive Analysis, Growth, Recommendations
- Export button

### 5. Companies Page (`/companies`)
- Grid of analyzed companies
- Analysis count and last analysis date
- Empty state with CTA

### 6. Company Detail Page (`/companies/[id]`)
- List of all analyses for a company
- Chronological order
- Quick access to reports

### 7. Pricing Page (`/pricing`)
- Three-tier pricing (Starter, Professional, Enterprise)
- Highlighted recommended plan
- FAQ section

### 8. Profile Page (`/profile`)
- Account information
- Subscription details with usage meter
- Quick actions
- Account management (logout, delete)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-key"
```

## API Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/analyze` - Analyze company
- `GET /api/analysis/report/[id]` - Get report
- `GET /api/companies` - List companies
- `GET /api/companies/[id]` - Company details
- `GET /api/profile` - User profile

## Design Principles

1. **Clarity Over Cleverness**: Every element serves a purpose
2. **Whitespace is Content**: Generous spacing aids comprehension
3. **Typography First**: Let text breathe, use hierarchy effectively
4. **Subtle Animations**: Enhance UX without distraction
5. **Consistency**: Same patterns throughout the app

## Browser Support

- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)

Optimized for desktop and tablet. Mobile navigation needs enhancement.

## Performance

- Server-side rendering for initial load
- Client-side navigation for smooth transitions
- Optimized fonts (system fonts = zero load time)
- Minimal CSS bundle

## Future Enhancements

- [ ] Mobile menu/hamburger navigation
- [ ] Dark mode (pure inversion of monochrome palette)
- [ ] Keyboard shortcuts
- [ ] Advanced filtering on companies page
- [ ] Real-time analysis progress
- [ ] PDF export with styled templates

## License

Proprietary - All rights reserved

---

Built with attention to detail and respect for minimalism.
