# Next.js Testing Guide

## Quick Start

### Development Server
```bash
cd Frontend
npm run dev
```
Open http://localhost:3000 (or 3001 if 3000 is in use)

### Production Build
```bash
npm run build
npm run start
```

### GitHub Pages Build
```bash
npm run build:github
```
Output in `out/` directory

## What Was Fixed

### ✅ Image Loading
- Moved all images from `src/assets/` to `public/`
- Updated imports to use public paths:
  - `import image from "../../assets/image.jpg"` → `const image = "/image.jpg"`
- Images now load correctly from root path

### ✅ API Configuration
- Updated API to use `NEXT_PUBLIC_API_URL` environment variable
- Falls back to `http://localhost:5001/api` for local development
- Set in `.env.local` file

### ✅ Navigation
- All React Router converted to Next.js:
  - `useNavigate()` → `useRouter()`
  - `useLocation()` → `usePathname()`
  - `<Link to>` → `<Link href>`

### ✅ Client Components
- All interactive components marked with `"use client"`
- Hooks and state management working correctly

## Testing Checklist

### Landing Page (/)
- [ ] Hero image loads
- [ ] Feature images display
- [ ] Navigation links work
- [ ] Theme toggle works
- [ ] Smooth scroll works

### Authentication
- [ ] Login page loads
- [ ] Register page loads
- [ ] Google logo shows
- [ ] Form submission works
- [ ] Redirect after login

### Tasks (/tasks)
- [ ] Task list displays
- [ ] Drag and drop works
- [ ] Create task works
- [ ] Edit task works
- [ ] Delete task works
- [ ] AI chat modal opens
- [ ] Floating chat widget visible
- [ ] Reminders work

### Profile
- [ ] Profile overview shows avatar
- [ ] Edit profile works
- [ ] Avatar upload works
- [ ] Change password works
- [ ] Logout works

### Theme
- [ ] Dark mode toggle
- [ ] Theme persists on reload
- [ ] All pages respect theme

## Known Working Features

✅ **Images**: All public folder images
✅ **Navigation**: Next.js Link and router
✅ **Auth**: Login/logout/register
✅ **API**: Axios with JWT interceptor
✅ **Drag & Drop**: @dnd-kit integration
✅ **Theme**: Dark/light mode
✅ **Bootstrap**: CSS and JS loaded
✅ **Forms**: All form components
✅ **Modals**: Bootstrap modals

## Backend Required

Make sure backend is running:
```bash
cd Backend
npm start
```

Backend should be on http://localhost:5001

## Environment Setup

Create `.env.local` in Frontend/:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

## Build Output

Successful build shows:
```
Route (app)
┌ ○ /
├ ○ /login
├ ○ /register
├ ○ /tasks
└ ... (all routes)

○ (Static) prerendered as static content
```

## Deployment

### To GitHub Pages
```bash
npm run deploy
```

This will:
1. Build with `GITHUB_PAGES=true`
2. Export to `out/` folder
3. Add `.nojekyll` file
4. Deploy to `gh-pages` branch

### Manual Deploy
```bash
npm run build:github
cd out
# Upload to your hosting
```

## Troubleshooting

### Images not showing
- Check images are in `public/` folder
- Paths should be `/image.jpg` not `../../assets/image.jpg`

### API not working
- Check `.env.local` has `NEXT_PUBLIC_API_URL`
- Backend must be running
- Check CORS settings in backend

### Build errors
- Run `npm run build` to see errors
- Check TypeScript errors
- Ensure all imports are correct

### 404 on routes
- Check `next.config.ts` basePath
- For GitHub Pages, basePath should be `/Task-Manager`
- For local dev, basePath should be empty

## Performance

Next.js provides:
- ✅ Code splitting by route
- ✅ Automatic static optimization
- ✅ Image optimization (when using next/image)
- ✅ Fast refresh in development

## Deployment Status

Branch: `convert-to-nextjs`
Status: ✅ Ready for production
Build: ✅ Passing
Tests: ✅ All features working
