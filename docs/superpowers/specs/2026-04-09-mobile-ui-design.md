# Akiba Mobile UI — Iteration 3 Design Spec

## Summary

Build all mobile app screens for the Akiba wealth management platform using React Native + Expo Router. The app targets Senegalese users with a premium, dark-accented visual style (navy headers, green accents). All ~15 screens will be implemented, with seeded mock data so every screen looks populated for demos.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Full app (~15 screens) | Complete demo-ready product |
| Visual style | Premium & dark-accented | Navy + green, Wealthsimple-inspired, trust-building |
| Onboarding | Illustration-based carousel | 3 slides with placeholder illustrations, swap later |
| Mock data | Seeded mock data | Every screen populated for demos |
| Build approach | Components-first + mock-data-first (B+C) | Consistency + real data shapes from the start |

## 1. Mock Data Layer

Location: `src/mocks/`

### Files

- **assets.ts** — 12 sample assets:
  - 4 BRVM equities: Sonatel (SNTS), BOA Senegal (BOAS), Total CI (TTLC), Nestle CI (NTLC)
  - 3 government bonds: BOAD 2025 6.5%, Tresor SN 2026 5.8%, Tresor SN 2027 6.0%
  - 2 Sukuk: Sukuk Senegal 2026 5.5% (halal), Sukuk BOAD 2025 6.0% (halal)
  - 2 mutual funds: FCP BRAO Equilibre, FCP Horizon Croissance
  - 1 savings vault: Akiba Vault (3.5% APY)

- **portfolio.ts** — 1 robo-managed "balanced" portfolio:
  - 8 holdings across equities, bonds, sukuk
  - Total value: ~485,000 FCFA
  - Performance: +8.3% since inception
  - 30 data points of historical performance (daily, 1 month)
  - Allocation breakdown: 30% equities, 25% bonds, 20% sukuk, 15% funds, 10% vault

- **transactions.ts** — 15 sample transactions over 3 months:
  - 3 deposits (Wave, Orange Money)
  - 5 investments (various assets)
  - 3 dividends
  - 2 additional deposits
  - 1 withdrawal
  - 1 savings contribution

- **goals.ts** — 3 savings goals:
  - Emergency fund: 120,000 / 200,000 FCFA (60%), deadline Dec 2026
  - Hajj 2027: 250,000 / 1,000,000 FCFA (25%), monthly auto-deposit 50,000
  - Education: 15,000 / 150,000 FCFA (10%), deadline Sep 2027

- **user.ts** — Demo user profile:
  - Aminata Diallo, +221 77 000 12 34
  - KYC Tier 1 verified, balanced risk profile
  - Wallets: cash (75,000), investment (485,000), savings (385,000)
  - Preferred language: French
  - Halal mode: off

- **index.ts** — `useMockData()` hook:
  - On app load, injects all mock data into Zustand stores
  - Replaces what React Query would do with real API responses
  - Guarded by `__DEV__` or env flag so it's stripped in production

## 2. Enhanced Component Library

### New Components

All in `src/components/`:

| Component | Location | Purpose |
|-----------|----------|---------|
| **TransactionItem** | `ui/TransactionItem.tsx` | Row: icon (color-coded by type), description, amount (+green/-red), date |
| **AssetCard** | `ui/AssetCard.tsx` | Ticker + name, price, daily % change (green/red), halal badge |
| **HoldingRow** | `ui/HoldingRow.tsx` | Asset name, quantity, current value, gain/loss % |
| **GoalCard** | `ui/GoalCard.tsx` | Goal icon by type, name, progress bar, current/target, deadline |
| **BalanceCard** | `ui/BalanceCard.tsx` | Navy gradient bg, total balance (white, large), gain/loss, 3 quick action buttons (Invest, Deposit, Withdraw) |
| **AllocationBar** | `ui/AllocationBar.tsx` | Horizontal stacked bar: equities (green), bonds (blue), sukuk (gold), funds (purple), cash (gray) |
| **SectionHeader** | `ui/SectionHeader.tsx` | Label + optional "See all" link, consistent spacing |
| **EmptyState** | `ui/EmptyState.tsx` | Icon + message + CTA button |
| **PinInput** | `ui/PinInput.tsx` | 6 boxes, auto-advance, secure dots, backspace support |
| **OnboardingSlide** | `ui/OnboardingSlide.tsx` | Illustration placeholder area + title + subtitle text |

### Enhanced Existing

- **Card** (`ui/Card.tsx`): Add `variant` prop — `elevated` (default), `flat`, `gradient` (navy bg for premium sections)

### Design Tokens Used

From existing `src/constants/`:
- Primary green: `#00A86B`
- Navy: `#1A1A2E`
- Gold: `#F5A623`
- Shadows: `sm`, `md`, `lg` presets
- Min touch target: 48px
- Screen padding: 16px
- Card padding: 16px
- Border radius: 12px (cards), 24px (buttons)

## 3. Screen Implementations

### Auth Stack — `app/(auth)/`

#### welcome.tsx
- Horizontal pager with 3 OnboardingSlides
- Slide 1: "Invest from 1,000 FCFA" — placeholder illustration (green bg, Ionicons `trending-up`)
- Slide 2: "BRVM stocks, bonds & Sukuk" — placeholder (navy bg, Ionicons `bar-chart`)
- Slide 3: "Learn as you earn" — placeholder (gold bg, Ionicons `school`)
- Dot indicators below slides
- Language picker (FR / WO / EN) at top-right
- "Get Started" primary button at bottom
- "Already have an account? Log in" link

#### register.tsx
- Navy header section with Akiba logo/name
- Phone input with Senegal flag prefix (+221), auto-format
- Full name input
- Referral code input (optional, collapsible)
- "Continue" button — calls register API, navigates to verify-otp
- Validation: Senegal phone format, min 2-word name

#### verify-otp.tsx
- Title: "Enter verification code"
- Subtitle: "Sent to +221 77 XXX XX XX"
- PinInput (6 digits) with auto-submit on last digit
- 60-second countdown timer for resend
- "Resend code" button (disabled during countdown)
- Auto-navigates to set-pin on success (new user) or home (login)

#### set-pin.tsx (new file — currently doesn't exist as auth screen)
- Two-step flow within one screen
- Step 1: "Create your PIN" — PinInput with secure dots
- Step 2: "Confirm your PIN" — second PinInput
- Mismatch error with shake animation
- Success: checkmark animation, navigate to home tabs

#### login.tsx (new file — separate from register flow)
- Phone input + PIN entry (PinInput, 6 digits)
- "Forgot PIN?" link (placeholder — shows alert for now)
- "Log in" button
- "Don't have an account? Register" link at bottom

#### kyc.tsx (existing — accessed from Profile, not auth flow)
- Step-by-step: ID front photo → ID back photo → selfie
- Camera/gallery picker using expo-image-picker
- Preview of each captured image
- National ID number input (optional)
- Submit button with loading state
- Called from Profile screen when user wants to upgrade tier

#### risk-assessment.tsx (existing — accessed from Profile)
- 5 questions, one per page with next/back
- Q1: Income range (4 options, radio-style cards)
- Q2: Investment horizon (3 options)
- Q3: Investment experience (4 options)
- Q4: Risk tolerance (slider 1-10)
- Q5: Max acceptable loss (slider 1-50%)
- Results page: risk profile + pie chart of recommended allocation
- "Accept & Continue" button

### Tab Screens — `app/(tabs)/`

#### index.tsx (Home Dashboard)
- Greeting: "Bonjour, Aminata" + notification bell icon (top-right)
- **BalanceCard**: Navy gradient, total value (945,000 FCFA), gain/loss (+8.3%), three quick action IconButtons (Invest → markets, Deposit → deposit modal, Withdraw → withdraw modal)
- **SectionHeader** "My Portfolio" + "See all"
- **AllocationBar** showing asset class breakdown
- Top 3 **HoldingRow** items
- **SectionHeader** "Recent Activity" + "See all"
- Last 5 **TransactionItem** entries
- **Card** "Savings Goals" showing total progress across goals

#### markets.tsx
- Search bar at top (text input with search icon)
- Filter chips row: All | Equities | Bonds | Sukuk | Funds
- Halal toggle switch (top-right, filters to sharia-compliant only)
- Scrollable list of **AssetCard** items
- Tap asset → navigates to `asset/[id]`

#### goals.tsx
- Summary card at top: total savings across all goals + overall progress %
- List of **GoalCard** items
- Floating action button (+) → navigates to `goal/create`
- Tap goal → navigates to `goal/[id]`

#### learn.tsx
- Category grid (2x2): Investing 101, Islamic Finance, BRVM Guide, Budgeting
- Each category: icon + title + lesson count badge
- Tap category → scrollable lesson list (static content)
- Each lesson card: title, duration estimate, completion status
- Content is placeholder text for now

#### profile.tsx
- User avatar (initials circle, navy bg) + full name + phone
- KYC status badge (verified = green, pending = gold, unverified = gray)
- Menu list items:
  - Edit Profile → inline edit (name, email, DOB)
  - KYC Verification → navigates to kyc.tsx
  - Risk Assessment → navigates to risk-assessment.tsx
  - Halal Preference → toggle switch (inline)
  - Language → picker (FR / WO / EN)
  - Security → PIN change, biometrics toggle (placeholder)
  - About Akiba → app version
  - Logout → confirms, clears tokens, navigates to welcome

### Modal Screens — `app/`

#### deposit.tsx
- Title: "Deposit Funds"
- Available balance shown
- **AmountPicker** with preset buttons: 5,000 / 10,000 / 25,000 / 50,000 FCFA
- Custom amount input
- Payment source selector: Wave (icon), Orange Money (icon), Free Money (icon)
- "Confirm Deposit" button
- Success screen with transaction details

#### withdraw.tsx
- Title: "Withdraw Funds"
- Available balance shown prominently
- **AmountPicker** (same pattern as deposit)
- Destination selector: Wave / Orange Money / Bank Transfer
- Reference/phone number input for destination
- "Confirm Withdrawal" button
- Success screen with estimated completion time

#### portfolio/[id].tsx
- Portfolio name + total value header
- Performance **LineChart** with period toggles: 1W / 1M / 3M / 1Y
- Gain/loss summary (amount + %)
- **AllocationBar**
- Full list of **HoldingRow** items
- "Invest More" button at bottom

#### asset/[id].tsx
- Asset name + ticker + current price
- Price **LineChart** with period toggles
- Key stats grid:
  - Equities: Market cap, P/E ratio, dividend yield
  - Bonds: Coupon rate, maturity date, yield
  - Sukuk: Profit rate, maturity, halal certification badge
  - Funds: NAV, expense ratio, 1Y return
- Halal badge if applicable
- "Invest" button → amount picker inline → confirm

#### goal/create.tsx
- Goal type picker: icon grid (6 types: Emergency, Hajj, Education, Housing, Business, Custom)
- Goal name input
- Target amount input (FCFA)
- Target deadline (date picker)
- Suggested monthly contribution (auto-calculated)
- Auto-invest toggle (optional — allocate to portfolio)
- "Create Goal" button

#### goal/[id].tsx
- Goal name + type icon + progress ring
- Current / target amounts
- Days remaining + monthly contribution
- Contribution history list
- "Add Funds" button → amount picker → confirm

## 4. Navigation & App Shell

### Root Layout — `app/_layout.tsx`
- Wraps app in providers: QueryClientProvider, mock data injector
- Auth gate: checks `isAuthenticated` from Zustand
  - Not authenticated → redirect to `(auth)/welcome`
  - Authenticated + `needsPin` → redirect to `(auth)/set-pin`
  - Authenticated → render `(tabs)/`
- StatusBar: `light-content` globally (works with navy headers)

### Auth Layout — `app/(auth)/_layout.tsx`
- Stack navigator
- No default headers (each screen has custom header or none)
- Slide-from-right transitions
- Screens: welcome, register, verify-otp, set-pin, login, kyc, risk-assessment

### Tab Layout — `app/(tabs)/_layout.tsx`
- 5 tabs using Expo Router Tabs
- Tab bar: navy background (`#1A1A2E`), green active icon (`#00A86B`), gray inactive
- Icons (Ionicons): home, trending-up, flag, book, person
- Labels below icons: Home, Markets, Goals, Learn, Profile
- Tab bar height: 56px + safe area

### Modal Presentation
- `deposit.tsx`, `withdraw.tsx`, `goal/create.tsx`: present as modal (slide from bottom)
- `portfolio/[id].tsx`, `asset/[id].tsx`, `goal/[id].tsx`: push as full screen with back button

## 5. Technical Notes

### Data Flow
- Mock data loads on app start via `useMockData()` hook in root layout
- Data injected into Zustand stores (same stores React Query would populate)
- Components read from Zustand (not directly from mocks)
- When real APIs come online, remove mock injection — React Query fills stores instead

### Chart Data Limitation
- Mock data provides 30 daily data points (1 month)
- LineChart period toggles (1W/1M/3M/1Y) all use the same 30-point dataset
- When real market data APIs come online, each period will fetch appropriate granularity

### Styling Approach
- StyleSheet.create per component (React Native standard)
- All values from constants (colors, fonts, spacing) — no magic numbers
- LinearGradient for navy gradient backgrounds (BalanceCard, headers)
- Reanimated for subtle animations (button press, screen transitions)

### i18n
- All user-facing strings use `t()` from auth store
- Translations already exist in `src/i18n/` for FR, WO, EN
- New strings added to all 3 language files

### Accessibility
- All touch targets minimum 48x48px
- Contrast ratios: 4.5:1 for normal text, 3:1 for large
- Screen reader labels on all interactive elements
- Font scaling respected (no fixed pixel heights for text containers)
