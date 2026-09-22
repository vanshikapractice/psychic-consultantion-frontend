# Functional Requirements Specification — PsychicConnect

## Dual-Role User Authentication System

**Document version:** 1.0  
**Date:** 2026-09-21  
**Project:** `psychic-consultantion-frontend` (PsychicConnect)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional requirements for the dual-role user
authentication system in PsychicConnect. It defines access controls, home-page
views, and profile-management capabilities for the two primary user roles:
**Psychic** and **Customer**.

This specification serves as the contract between product stakeholders and the
engineering team. It references the existing codebase to ground every
requirement in a concrete file or module.

### 1.2 Scope

The system under specification includes:

- User registration with role selection (Psychic vs Customer).
- User login and JWT-based session management.
- Role-based authorization that controls page visibility, navigation, and
  feature access.
- A role-specific home page rendered after authentication.
- Role-specific profile management (professional profile for psychics;
  personal profile for customers).
- Customer ability to browse, search, and book psychics.
- Psychic ability to receive and act on incoming chat requests.

Out of scope: payment processing, real-time chat protocol implementation,
and psychic verification workflows (these are referenced only insofar as
they depend on the auth/role system).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| FRS | Functional Requirements Specification |
| JWT | JSON Web Token; used as the session token |
| Psychic | Role that provides consultation services; receives chat requests from customers |
| Customer | Role that seeks and books consultations with psychics |
| RBAC | Role-Based Access Control |

### 1.4 References

- Codebase: `src/types/index.ts` — role and user type definitions
- Codebase: `src/contexts/AuthContext.tsx` — authentication context provider
- Codebase: `src/api/auth.ts` — auth API (login, register, profile)
- Codebase: `src/store/slices/authSlice.ts` — Redux auth state
- Codebase: `src/layouts/ProtectedRoute.tsx` — route protection utilities
- Codebase: `src/layouts/MainLayout.tsx` — role-aware navigation
- Codebase: `src/pages/Home.tsx` — customer home page (psychics list)
- Codebase: `src/pages/PsychicDashboard.tsx` — psychic dashboard (currently placeholder)

---

## 2. Overall Description

### 2.1 Product Perspective

PsychicConnect is a React + TypeScript single-page application (SPA) built with
Vite. State is managed via Redux Toolkit with side effects handled by
Redux-Saga. Server communication goes through a custom `ApiClient`
(`src/api/client.ts`) that attaches a Bearer JWT to every request. Routing is
handled by React Router v7. Styling uses TailwindCSS.

The authentication system is implemented through a layered architecture:

```
UI Layer (pages, components)
  └─ Context Layer (src/contexts/AuthContext.tsx)
      └─ Redux Layer (src/store/slices/authSlice.ts)
          └─ API Layer (src/api/auth.ts, src/api/token.ts)
              └─ Token Layer (localStorage persistence)
```

### 2.2 User Roles

| Role | Description | ID (role_id) |
|---|---|---|
| **Psychic** | Professional advisor who provides readings. Receives incoming chat requests from customers. Manages professional profile. | 2 (typical) |
| **Customer** | Seeker who browses, searches, and books psychics. Manages personal profile. | 1 (typical) |

Roles are fetched dynamically from the backend via `GET /api/roles`
(`src/api/roles.ts`) at registration time. Each role has an `id` and `name`
as defined by `RoleRecord` in `src/types/index.ts:3-6`.

### 2.3 Constraints

- The `User` type (`src/types/index.ts:8-17`) includes a `role` field of type
  `Role` (`"customer" | "psychic" | "admin"`).
- The JWT payload (`src/api/token.ts:3-9`) includes a `role` claim that
  determines the authenticated user's role.
- Role must be resolved and available in Redux state (`auth.user.role`) before
  any role-based rendering decision is made.
- The `MainLayout` component (`src/layouts/MainLayout.tsx:22`) already
  differentiates navigation items based on `user?.role === "psychic"`.

---

## 3. Specific Requirements

### 3.1 Authentication

#### 3.1.1 User Registration (FR-01)

**Description:** A new user registers by providing a name, email, password,
and selecting a role (Psychic or Customer).

| Attribute | Value |
|---|---|
| **Precondition** | User is on the `/register` page (rendered by `src/pages/Register.tsx`). |
| **Source** | `src/components/auth/RegisterForm.tsx` |
| **Trigger** | User submits the registration form. |
| **Main flow** | 1. Form validates all fields (non-empty name, valid email, password >= 8 chars, role selected).<br>2. Form dispatches `register` from `AuthContext` (`src/contexts/AuthContext.tsx:70`).<br>3. `authApi.register` sends `POST /api/auth/register` with `{ name, email, password, role_id }`.<br>4. Backend responds with `{ success, message, data: { token, user } }` (`AuthResponse` type, `src/types/index.ts:81-88`).<br>5. On success, token is stored in localStorage via `apiClient.setToken` (`src/api/client.ts:21`), and user state is set in Redux via `setAuth` (`src/store/slices/authSlice.ts:23`).<br>6. User is redirected to the home page (`/`). |
| **Postcondition** | User is authenticated with the selected role. |

**FR-01a — Role Selection:** The registration form presents a dropdown (`Select`
component, `src/components/auth/RegisterForm.tsx:137-149`) populated with roles
fetched from `GET /api/roles` (`src/api/roles.ts:129`). The selected role's
numeric `id` is sent as `role_id` in the registration request.

#### 3.1.2 User Login (FR-02)

**Description:** An existing user logs in using email and password.

| Attribute | Value |
|---|---|
| **Precondition** | User is on the `/login` page (rendered by `src/pages/Login.tsx`). |
| **Source** | `src/components/auth/LoginForm.tsx` |
| **Trigger** | User submits the login form. |
| **Main flow** | 1. Form validates email format and non-empty password.<br>2. Form calls `login` from `useAuth` (`src/contexts/AuthContext.tsx:55`).<br>3. `authApi.login` sends `POST /api/auth/login`.<br>4. Backend returns `{ token, user }` in `AuthResponse.data`.<br>5. Token is persisted to localStorage; user state is set in Redux.<br>6. User is redirected to `/` (or the page they were originally trying to reach). |
| **Postcondition** | User is authenticated with their assigned role. |

#### 3.1.3 Session Restoration on Refresh (FR-03)

**Description:** When the browser is refreshed, the application restores the
authenticated session from the persisted JWT without requiring the user to log in again.

| Attribute | Value |
|---|---|
| **Source** | `src/api/auth.ts:49` (`initAuthState`), `src/contexts/AuthContext.tsx:29` |
| **Trigger** | Application mount (`AuthProvider` initialization). |
| **Main flow** | 1. On mount, `AuthContext` calls `initAuthState()` (`src/api/auth.ts:49`).<br>2. `initAuthState` reads the token from `apiClient.token` (which reads from `localStorage` key `psychic_app_token`, `src/api/client.ts:18`).<br>3. If a token exists, it is decoded via `decodeUserProfile` (`src/api/auth.ts:21`) which extracts `userId`, `email`, `role`, and `roleId` from the JWT payload (`src/api/token.ts:36`).<br>4. A `User` object is reconstructed and dispatched to Redux via `setReduxAuth` (`src/contexts/AuthContext.tsx:32`).<br>5. Components subscribed to `selectAuthUser` (`src/store/selectors/authSelectors.ts:4`) re-render with the restored session. |
| **Postcondition** | User remains authenticated across page reloads. |

#### 3.1.4 Logout (FR-04)

**Description:** The user can end their session.

| Attribute | Value |
|---|---|
| **Source** | `src/contexts/AuthContext.tsx:85`, `src/layouts/MainLayout.tsx:57-63` |
| **Trigger** | User clicks "Logout" in the header. |
| **Main flow** | 1. `logout` in `AuthContext` is called (`src/contexts/AuthContext.tsx:85`).<br>2. React Query cache is cleared via `clearQueryCache` (`src/utils/cleanup.ts`).<br>3. Redux state is reset via `resetApp` (`src/store/resetAction.ts`).<br>4. localStorage entries are cleared via `clearAppStorage` (`src/utils/cleanup.ts`).<br>5. API token is cleared via `setAuth(null, null)` which calls `apiClient.setToken(null)`. |
| **Postcondition** | User is unauthenticated; all session data is cleared. |

### 3.2 Role-Based Access Control (FR-05)

**Description:** Access to routes and features is restricted based on the
authenticated user's role.

| Attribute | Value |
|---|---|
| **Source** | `src/layouts/ProtectedRoute.tsx`, `src/layouts/MainLayout.tsx` |

**FR-05a — Authentication Gate:** All non-public routes are wrapped in
`ProtectedRoute` (`src/layouts/ProtectedRoute.tsx:11`). If no authenticated
user is found in Redux (`selectAuthUser` returns `null`), the user is
redirected to `/login` with the original location stored in `state.from`.
This applies to `/bookings`, `/booking/:id`, `/consultation/:id`,
`/review/:consultationId`, `/profile`, and `/psychic/dashboard`.

**FR-05b — Role-Based Navigation:** The `MainLayout`
(`src/layouts/MainLayout.tsx:18-23`) renders different navigation items
based on `user?.role`:

- **Psychic:** "Dashboard" → `/psychic/dashboard`, "My Sessions" → `/bookings`,
  "Profile" → `/profile`.
- **Customer:** "Find a Psychic" → `/`, "My Bookings" → `/bookings`,
  "Profile" → `/profile`.

**FR-05c — Role-Based Home Page Redirect:** The application root route (`/`)
renders different content based on the user's role (see FR-06 and FR-07).

### 3.3 Psychic Role Requirements

#### 3.3.1 Psychic Home Page — Incoming Chat Requests (FR-06)

**Description:** When a psychic user logs in and navigates to `/` (the home
page), they see a view restricted to **incoming chat requests** from
customers. This content is NOT available to the Customer role.

| Attribute | Value |
|---|---|
| **Precondition** | User is authenticated with `role === "psychic"`. |
| **Source** | `src/pages/PsychicDashboard.tsx` (to be enhanced) |
| **Trigger** | Psychic navigates to `/`. |
| **Main flow** | 1. On `/`, if `user?.role === "psychic"`, the application redirects (or renders) the Psychic dashboard view instead of the psychics browse list.<br>2. The psychic dashboard displays incoming chat requests — i.e., consultation sessions initiated by customers that require the psychic's attention.<br>3. Each incoming request shows: customer name, request timestamp, and session status (pending/active).<br>4. The psychic can accept/join a request, which navigates to the consultation chat
   (`src/pages/Consultation.tsx`). |
| **Postcondition** | Psychic can view and respond to incoming customer chat requests. |

**FR-06a — Visibility Restriction:** The psychic home page view is
restricted to only incoming chat requests. No psychic browsing list,
customer bookings, or other customer-facing content is shown on this view.

**FR-06b — Chat Request Data Source:** Incoming chat requests are fetched
from the consultations API (`src/api/consultations.ts`). A dedicated
endpoint such as `GET /api/consultations/incoming` (or the bookings list
filtered by the psychic's role) should provide the list of pending
consultations assigned to the authenticated psychic.

#### 3.3.2 Psychic Profile Management (FR-07)

**Description:** A psychic can update and manage their professional profile,
including bio, specialties, rate, years of experience, and profile image.

| Attribute | Value |
|---|---|
| **Precondition** | User is authenticated with `role === "psychic"`. |
| **Source** | `src/api/psychics.ts:383` (`updateProfile`), `src/pages/Profile.tsx` |
| **Trigger** | Psychic selects "Profile" from navigation and edits profile fields. |
| **Main flow** | 1. Psychic navigates to `/profile`.<br>2. The Profile page renders the psychic's current professional profile data (bio, specialties, rate, etc.) fetched from `GET /api/users/profile`.<br>3. Psychic clicks "Edit Profile".<br>4. Editable fields appear (bio, specialties, rate, years of experience, profile image URL).<br>5. Psychic submits edits.<br>6. The `updateProfile` action is dispatched, which calls `psychicsApi.updateProfile` (`src/api/psychics.ts:383-402`), sending `PUT /api/psychics/profile` with the updated fields.<br>7. The response is normalized via `normalizePsychicResponse` and stored in Redux via `updatePsychicProfile` (`src/store/slices/psychicSlice.ts:46-53`). |
| **Postcondition** | Psychic's professional profile is updated on the server and locally. |

**FR-07a — Professional Profile Fields:** The psychic profile edit form
includes: display name, bio, specialties (multi-select from `SPECIALTIES`
in `src/types/index.ts:102-119`), rate/price per minute, years of experience,
and profile image URL.

**FR-07b — Profile Data Persistence:** Profile updates are persisted via
`PUT /api/psychics/profile` and the response updates both the Redux
`psychics.selected` state and the auth user object.

### 3.4 Customer Role Requirements

#### 3.4.1 Customer Home Page — Psychics Directory (FR-08)

**Description:** When a customer logs in and navigates to `/`, they see a
searchable and browsable list of available psychics.

| Attribute | Value |
|---|---|
| **Precondition** | User is authenticated with `role === "customer"` (or not authenticated — the home page is also public). |
| **Source** | `src/pages/Home.tsx`, `src/components/psychics/PsychicList.tsx`, `src/components/psychics/PsychicFilter.tsx` |
| **Trigger** | Customer navigates to `/`. |
| **Main flow** | 1. `Home` renders a hero section and a `PsychicsList` component (`src/pages/Home.tsx:24`).<br>2. `PsychicsList` dispatches `{ type: "psychics/fetch" }` on mount (`src/components/psychics/PsychicList.tsx:14-16`).<br>3. The saga fetches all psychics via `psychicsApi.getPsychics` (`src/api/psychics.ts:313-349`), which calls `GET /api/psychics`.<br>4. Psychics are stored in Redux state (`psychics.psychics`) and rendered as `PsychicCard` components (`src/components/psychics/PsychicCard.tsx`). |
| **Postcondition** | Customer sees the full directory of available psychics. |

**FR-08a — Search/Filter:** Customers can filter the psychic list by:
- **Specialty** — tag-based selection from `SPECIALTIES` (`src/components/psychics/PsychicFilter.tsx:23-41`).
- **Minimum Rating** — tag-based threshold selection (`PsychicFilter.tsx:44-61`).
- **Maximum Rate** — tag-based price ceiling (`PsychicFilter.tsx:63-80`).
- **Search** — text search by psychic name (field exists in `PsychicsFilter` type, `src/types/index.ts:121-126`).

Filtering updates Redux state via `setFilter` (`src/store/slices/psychicSlice.ts:25-27`) and the saga re-fetches with query parameters.

**FR-08b — Psychic Card Display:** Each `PsychicCard` shows: profile image/avatar, name, primary specialty badge, rating (★), review count, rate per minute, and years of experience badge. Clicking a card navigates to `/psychic/:id` (`PsychicCard.tsx:20`).

#### 3.4.2 Customer Booking (FR-09)

**Description:** A customer can book a consultation with a psychic from the
psychics list.

| Attribute | Value |
|---|---|
| **Precondition** | Customer is authenticated. |
| **Source** | `src/pages/PsychicDetail.tsx`, `src/components/bookings/BookingForm.tsx` |
| **Trigger** | Customer clicks a psychic card and submits a booking form. |
| **Main flow** | 1. Customer clicks a `PsychicCard`, navigating to `/psychic/:id`.<br>2. `PsychicDetail` (`src/pages/PsychicDetail.tsx`) fetches the psychic via `{ type: "psychics/fetchOne", payload: id }`.<br>3. The page renders the psychic's profile and a `BookingForm` sidebar (`PsychicDetail.tsx:98-101`).<br>4. Customer selects date, time, and duration in the booking form.<br>5. The form dispatches `{ type: "bookings/create", payload: { psychicId, dateTime, duration } }` (`src/components/bookings/BookingForm.tsx:39-42`).<br>6. The booking saga calls `bookingsApi.create` (`src/api/bookings.ts:55-57`), which sends `POST /api/bookings` with `{ psychic_id, scheduled_at, duration_minutes }`.<br>7. On success, the customer is redirected to `/bookings`. |
| **Postcondition** | A booking record is created and visible in the customer's "My Bookings" page. |

**FR-09a — Booking Validation:** The `BookingForm` validates that:
- Date and time are selected (`BookingForm.tsx:26-28`).
- The selected date/time is in the future (`BookingForm.tsx:31-36`).

**FR-09b — Cost Estimation:** The `BookingForm` displays an estimated cost
calculated as `duration * psychic.rate` (`BookingForm.tsx:46`), shown in the
submit button label.

#### 3.4.3 Customer Profile Management (FR-10)

**Description:** A customer can update and manage their personal user profile,
including name and profile image.

| Attribute | Value |
|---|---|
| **Precondition** | User is authenticated with `role === "customer"`. |
| **Source** | `src/pages/Profile.tsx`, `src/api/auth.ts:13` (`updateProfile`) |
| **Trigger** | Customer selects "Profile" from navigation and edits profile fields. |
| **Main flow** | 1. Customer navigates to `/profile`.<br>2. The Profile page renders the customer's current profile data (name, email, role, member since) fetched from the auth user state (`Profile.tsx:22-67`).<br>3. Customer clicks "Edit Profile".<br>4. Editable fields appear (name, profile image URL).<br>5. Customer submits edits.<br>6. The form dispatches `{ type: "auth/updateProfile", payload: { name, profileImage } }` (`Profile.tsx:27`).<br>7. The auth saga calls `authApi.updateProfile` (`src/api/auth.ts:13`), which sends `PUT /api/users/profile`.<br>8. The updated user is stored in Redux via `updateUser` (`src/store/slices/authSlice.ts:40`). |
| **Postcondition** | Customer's personal profile is updated on the server and locally. |

**FR-10a — Personal Profile Fields:** The customer profile edit form
includes: full name and profile image URL. Email is display-only (managed by
the auth backend).

**FR-10b — Profile Data Persistence:** Profile updates are persisted via
`PUT /api/users/profile` and the response updates the Redux `auth.user`
state.

---

## 4. External Interface Requirements

### 4.1 User Interface

#### 4.1.1 Shared Layout

All authenticated pages are rendered within `MainLayout`
(`src/layouts/MainLayout.tsx`), which provides:

- A header with the application logo ("🔮 PsychicConnect"),
  role-based navigation links, and a user section showing the avatar,
  name, and a "Logout" button (or "Login" / "Sign Up" links for
  unauthenticated users).
- A main content area (`<Outlet />`).
- A footer with the copyright notice.

#### 4.1.2 Role-Specific Home Page Routing

The `/` route (`src/App.tsx:30`) renders `<Home />` for all users. Per
**FR-05c**, the rendered content must branch based on role:

```
/  ──►  role === "psychic"   ──►  PsychicDashboard (incoming chat requests)
        role === "customer"  ──►  Home (psychics directory with search)
        role === null        ──►  Home (public psychics directory)
```

#### 4.1.3 Authentication Pages

- `/login` — `src/pages/Login.tsx` → renders `LoginForm`
  (`src/components/auth/LoginForm.tsx`)
- `/register` — `src/pages/Register.tsx` → renders `RegisterForm`
  (`src/components/auth/RegisterForm.tsx`)

Both are wrapped in `AuthLayout` (`src/layouts/AuthLayout.tsx`) and protected
by `PublicRoute` (so authenticated users are redirected away from them,
`src/layouts/ProtectedRoute.tsx:32`).

#### 4.1.4 Profile Page

- `/profile` — `src/pages/Profile.tsx`

The same page component serves both roles. The editable fields differ:
- **Psychic:** bio, specialties, rate, years of experience, profile image
- **Customer:** name, profile image URL

The page determines which fields to show based on `user?.role`.

### 4.2 API Interface

| Endpoint | Method | Purpose | Source |
|---|---|---|---|
| `/api/auth/register` | POST | Register with role selection | `src/api/auth.ts:10` |
| `/api/auth/login` | POST | Authenticate and receive JWT | `src/api/auth.ts:8` |
| `/api/users/profile` | GET | Fetch user profile | `src/api/auth.ts:12` |
| `/api/users/profile` | PUT | Update customer profile | `src/api/auth.ts:13` |
| `/api/roles` | GET | List available roles | `src/api/roles.ts:129` |
| `/api/psychics` | GET | List all psychics | `src/api/psychics.ts:313` |
| `/api/psychics/:id` | GET | Get single psychic detail | `src/api/psychics.ts:354` |
| `/api/psychics/profile` | PUT | Update psychic professional profile | `src/api/psychics.ts:383` |
| `/api/bookings` | POST | Create a booking (customer) | `src/api/bookings.ts:55` |
| `/api/bookings/my` | GET | List customer's bookings | `src/api/bookings.ts:57` |
| `/api/bookings?filterBy=psychic` | GET | List psychic's sessions | `src/api/bookings.ts:57` |

### 4.3 Hardware and Software

- **Client:** Modern browser supporting ES2020+ (React 19, TypeScript 6).
- **Storage:** JWT stored in `localStorage` under key `psychic_app_token`
  (`src/api/client.ts:3`).
- **Network:** REST over HTTPS; Bearer token authentication via request
  interceptor (`src/api/client.ts:143-151`).

---

## 5. Non-Functional Requirements

### 5.1 Security

- **NFI-01:** The JWT token is attached to every API request via the
  `ApiClient` request interceptor (`src/api/client.ts:143-151`). No
  authenticated request is sent without the token.
- **NFI-02:** On logout, all client-side session state is cleared: token
  removed from localStorage, Redux state reset (`resetApp`,
  `src/store/resetAction.ts`), React Query cache cleared
  (`src/utils/cleanup.ts`), and localStorage entries purged
  (`clearAppStorage`).
- **NFI-03:** Route protection is enforced at the routing layer via
  `ProtectedRoute` (`src/layouts/ProtectedRoute.tsx:11`), ensuring that
  protected pages are inaccessible without authentication even if the URL
  is entered directly.

### 5.2 Usability

- **NFI-04:** Loading states are shown for all async operations using
  `Spinner` (`src/components/ui/Spinner.tsx`) and `state-container`
  layout (e.g., `PsychicDetail.tsx:34-41`).
- **NFI-05:** Error states display user-friendly messages with retry
  options (e.g., `PsychicDetail.tsx:43-52`, `PsychicList.tsx:28-35`).
- **NFI-06:** Forms provide inline validation with field-level error
  messages (e.g., `RegisterForm.tsx:54-65`, `LoginForm.tsx:21-28`,
  `BookingForm.tsx:26-36`).

### 5.3 Performance

- **NFI-07:** Psychics are fetched once and cached in Redux state
  (`psychics.psychics`). The filter component updates the filter state in
  Redux, triggering a re-fetch rather than re-filtering client-side
  (`src/components/psychics/PsychicList.tsx:14-16`,
  `src/store/slices/psychicSlice.ts:25-27`).

### 5.4 Data Consistency

- **NFI-08:** All API responses are normalized through dedicated
  `normalize*` functions that handle multiple backend field name
  conventions (snake_case vs camelCase). For example,
  `normalizePsychic` (`src/api/psychics.ts:82-197`) accepts both
  `price_per_minute` and `pricePerMinute`.
- **NFI-09:** Redux actions use string action types
  (`"bookings/fetch"`, `"psychics/fetchOne"`, etc.) dispatched from
  `useAppDispatch` (`src/store/hooks.ts:1`), handled by Redux-Saga
  watchers (e.g., `src/store/sagas/bookingSaga.ts:58-63`,
  `src/store/sagas/psychicSaga.ts:76-80`).

---

## 6. Access Control Matrix

| Feature | Customer | Psychic | Unauthenticated |
|---|---|---|---|
| View home page (psychics directory) | Yes | No (sees chat requests instead) | Yes (read-only) |
| View incoming chat requests | No | Yes | No |
| Search/filter psychics | Yes | N/A | Yes |
| Book a consultation | Yes | No | No (redirect to login) |
| View own bookings | Yes | Yes (as "My Sessions") | No |
| View psychic detail page | Yes | N/A | Yes |
| Edit personal profile (name, image) | Yes | Yes | No |
| Edit professional profile (bio, rate, specialties) | No | Yes | No |
| Access dashboard page | No | Yes (`/psychic/dashboard`) | No |
| Access consultations | Yes (after booking) | Yes (as provider) | No |

---

## 7. Requirements Traceability

| Requirement ID | Description | Related Files |
|---|---|---|
| FR-01 | User registration with role selection | `RegisterForm.tsx`, `auth.ts:10`, `authSlice.ts:23` |
| FR-02 | User login | `LoginForm.tsx`, `auth.ts:8` |
| FR-03 | Session restoration on refresh | `auth.ts:49`, `AuthContext.tsx:29` |
| FR-04 | Logout | `AuthContext.tsx:85`, `MainLayout.tsx:57` |
| FR-05a | Authentication gate on protected routes | `ProtectedRoute.tsx:11` |
| FR-05b | Role-based navigation | `MainLayout.tsx:18-23` |
| FR-05c | Role-based home page routing | `App.tsx:30`, `Home.tsx` |
| FR-06 | Psychic home page (incoming chat requests) | `PsychicDashboard.tsx`, `ConsultationPage.tsx` |
| FR-06a | Visibility restriction (psychic only) | `ProtectedRoute.tsx`, `MainLayout.tsx` |
| FR-06b | Chat request data source | `consultations.ts`, `bookings.ts:57` |
| FR-07 | Psychic profile management | `psychics.ts:383`, `Profile.tsx` |
| FR-07a | Professional profile fields | `types/index.ts:19-33`, `SPECIALTIES` |
| FR-07b | Profile data persistence | `psychicSlice.ts:46`, `psychicSaga.ts:62` |
| FR-08 | Customer home page (psychics directory) | `Home.tsx`, `PsychicList.tsx`, `PsychicFilter.tsx` |
| FR-08a | Search and filter | `PsychicFilter.tsx`, `types/index.ts:121` |
| FR-08b | Psychic card display | `PsychicCard.tsx` |
| FR-09 | Customer booking | `PsychicDetail.tsx`, `BookingForm.tsx` |
| FR-09a | Booking validation | `BookingForm.tsx:26-36` |
| FR-09b | Cost estimation | `BookingForm.tsx:46` |
| FR-10 | Customer profile management | `Profile.tsx`, `auth.ts:13` |
| FR-10a | Personal profile fields | `types/index.ts:8-17` |
| FR-10b | Profile persistence | `authSlice.ts:40`, `AuthContext.tsx:96` |
