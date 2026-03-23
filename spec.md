# Hospital Intelligence System

## Current State
The app has a sidebar + header layout with 5 pages: Dashboard, Patients, Doctors, Appointments, Analytics. The default landing view is the Dashboard. There is no dedicated home/landing page showing role module cards.

## Requested Changes (Diff)

### Add
- A new `Home` landing page (default view) that displays three role module cards: Admin, Doctor, Patient
- Each card has: an illustration image at the top, role name label, and a black "View" button
- Blue top navigation bar showing "Hospital Management" with nav links: Admin, Doctor, Patient (left side) and About Us, Contact Us (right side)
- Dark footer with social media icon buttons (Facebook, WhatsApp, Instagram, Twitter) and copyright text
- Clicking "View" on Admin card navigates to Dashboard
- Clicking "View" on Doctor card navigates to Doctors page
- Clicking "View" on Patient card navigates to Patients page
- Nav links also navigate to respective pages

### Modify
- App.tsx: add "home" as a new Page type and default view; show the new Home page layout (blue nav + role cards + dark footer) when on "home"; keep existing sidebar layout for all other pages
- Header component: hide on "home" page (home page has its own nav bar)
- Sidebar: hide on "home" page

### Remove
- Nothing removed from existing pages

## Implementation Plan
1. Create `src/frontend/src/pages/Home.tsx` with the blue navbar, three role cards using generated avatar images, and dark footer with social icons
2. Update App.tsx to include "home" page type, default to "home", render Home without sidebar/header, keep sidebar layout for other pages
3. Home page "View" buttons and nav links call `onNavigate` prop to switch to the appropriate page
