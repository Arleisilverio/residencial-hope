# AI Development Rules for Condomínio Residencial Hope

This document outlines the rules and conventions for the AI assistant to follow when developing this application. Adhering to these guidelines ensures consistency, maintainability, and quality in the codebase.

## Tech Stack Overview

The application is built with a modern, component-based architecture. The key technologies are:

- **Framework**: React 19 with TypeScript for type safety.
- **Build Tool**: Vite for fast development and optimized builds.
- **Styling**: Tailwind CSS for a utility-first styling approach.
- **UI Components**: Pre-built components from the `shadcn/ui` library are preferred.
- **Routing**: `react-router-dom` for client-side navigation.
- **Icons**: `lucide-react` for a consistent and clean icon set.
- **Notifications**: `react-hot-toast` for user feedback and alerts.
- **Backend & Auth**: Supabase for database, authentication, and storage.
- **State Management**: React Context API for global state and standard hooks (`useState`, `useEffect`) for local state.

## Library Usage and Coding Conventions

### 1. UI and Styling
- **Component Library**: ALWAYS prioritize using components from the `shadcn/ui` library. Do not install them, as they are assumed to be available.
- **Custom Components**: If a required component is not available in `shadcn/ui`, create a new, reusable component in the `src/components` directory.
- **Styling**: Use Tailwind CSS utility classes directly in the JSX. AVOID creating separate CSS files or using inline `style` objects unless absolutely necessary.
- **Responsiveness**: All components and pages MUST be designed to be responsive and work well on various screen sizes, from mobile to desktop.

### 2. Routing
- **Router**: All routing is handled by `react-router-dom`.
- **Route Definitions**: Main route configuration should be kept within `src/App.tsx`.
- **Navigation**: Use the `<Link>` component for declarative navigation and the `useNavigate` hook for programmatic navigation.

### 3. State Management
- **Global State**: For application-wide state (e.g., user authentication), use the React Context API. Create new contexts in the `src/contexts` directory.
- **Local State**: For component-specific state, use the `useState` and `useReducer` hooks.

### 4. Backend Interaction (Supabase)
- **Client**: All communication with the backend MUST use the Supabase client instance exported from `src/services/supabase.ts`.
- **Data Fetching**: Fetch data within components using `useEffect` or custom hooks.
- **Types**: Use the TypeScript types defined in `types.ts` for all data models (e.g., `UserProfile`, `Apartment`).

### 5. Icons and Notifications
- **Icons**: ONLY use icons from the `lucide-react` package. This ensures visual consistency.
- **User Feedback**: Use `react-hot-toast` to provide non-blocking feedback to the user for actions like form submissions, API calls, and errors.

### 6. Code Structure
- **Pages**: Place top-level page components in `src/pages`. Pages can be organized into subdirectories (e.g., `src/pages/admin`, `src/pages/tenant`).
- **Components**: Place reusable components in `src/components`.
- **Hooks**: Custom hooks should be placed in `src/hooks`.
- **Types**: Central type definitions are located in `types.ts`.
- **File Naming**: Use PascalCase for component files (e.g., `ApartmentCard.tsx`) and camelCase for non-component files (e.g., `useAuth.ts`).