# Codebase Overview for Aparie

This document provides a detailed overview of the Aparie project\'s file structure and the purpose of each component. It is organized by directories, starting from the root, then `src/`, `public/`, `supabase/`, and their respective subdirectories.

**How to Navigate This Document:**
*   The document is structured hierarchically, mirroring the project\'s directory layout.
*   Each file or significant directory has a brief description of its role and functionality.
*   Use your editor\'s search functionality (Ctrl+F or Cmd+F) to quickly find specific files, keywords, or component names.
*   Pay attention to cross-references where files interact (e.g., a component in `src/components/` being used by a page in `src/pages/`).

---

## Root Directory:

*   **`.git/`**: Contains all Git version control metadata and object database for the project. (Typically ignored by developers in daily tasks).
*   **`node_modules/`**: Stores all project dependencies (JavaScript/TypeScript libraries) downloaded by npm or Bun. (Typically ignored by developers and excluded from version control).
*   **`package.json`**:
    *   **Purpose**: Core manifest file for the Node.js project.
    *   **Details**: Defines project metadata (name: `vite_react_shadcn_ts`, version, type: `module`), scripts for development (`dev`), building (`build`, `build:dev`), linting (`lint`), previewing (`preview`), and Supabase database dumping (`db:dump`). Lists all production (`dependencies`) and development (`devDependencies`) packages. Key dependencies include React, Vite, Shadcn/UI components, Supabase client, TanStack Query, Tailwind CSS, Framer Motion, Lucide Icons, React Hook Form, React Router DOM, and Zod.
*   **`README.md`**:
    *   **Purpose**: Provides an overview of the project, setup instructions, and general information.
    *   **Details**: Mentions project generation by "Lovable," provides links, explains how to edit code (Lovable, IDE, GitHub, Codespaces). Lists technologies: Vite, TypeScript, React, shadcn-ui, Tailwind CSS. Includes deployment instructions (via Lovable) and how to dump the Supabase database.
*   **`package-lock.json`**:
    *   **Purpose**: Records the exact versions of dependencies used in the project, ensuring reproducible builds. Generated and managed by npm.
*   **`tsconfig.node.json`**:
    *   **Purpose**: TypeScript configuration specifically for Node.js-executed files like `vite.config.ts`.
    *   **Details**: Targets ES2022, uses ESNext modules, enables strict mode (with `noUnusedLocals` and `noUnusedParameters` turned off), and includes `vite.config.ts` in its compilation scope. `noEmit` is true as Vite handles transpilation.
*   **`vite.config.ts`**:
    *   **Purpose**: Configuration file for Vite, the frontend build tool.
    *   **Details**: Sets up the React plugin (`@vitejs/plugin-react-swc`), development server (port 8080), path alias `@` to `./src`. Includes `lovable-tagger` plugin for development. Features a custom plugin `handle-directory-imports` to resolve directory imports to their index files. For production builds: attempts `browserslist` update, minifies with `terser` (dropping console/debugger statements), disables sourcemaps, and configures Rollup for manual chunk splitting (vendor libraries, UI components).
*   **`tailwind.config.ts`**:
    *   **Purpose**: Configuration file for Tailwind CSS.
    *   **Details**: Enables class-based dark mode. Specifies content paths for scanning Tailwind classes. Defines a custom theme: container settings, extended colors (using CSS HSL variables for primary, secondary, destructive, muted, accent, popover, card, sidebar, and a custom `flashcard` theme), border radius (using `--radius` variable), and custom keyframes/animations (`accordion-down/up`, `card-flip`, `bounce-in`, `shake`, `float`, `slide-right`, `flash-correct`). Integrates the `tailwindcss-animate` plugin.
*   **`tsconfig.app.json`**:
    *   **Purpose**: TypeScript configuration for the main application code located in the `src/` directory.
    *   **Details**: Targets ES2020, uses ESNext modules, configured for `react-jsx` (new JSX transform). `moduleResolution` is set to `bundler`. `noEmit` is true. Strict type checking is disabled (`strict: false`), and specific strictness-related flags like `noUnusedLocals`, `noImplicitAny` are off. Includes the `src` directory for compilation and defines the `@` path alias.
*   **`tsconfig.json`**:
    *   **Purpose**: Root TypeScript configuration file.
    *   **Details**: Acts as a solution-style `tsconfig` by referencing `tsconfig.app.json` and `tsconfig.node.json`. Sets a `baseUrl` and the `@/*` path alias. Contains some relaxed compiler options like `noImplicitAny: false`, `skipLibCheck: true`, `allowJs: true`.
*   **`postcss.config.js`**:
    *   **Purpose**: Configuration file for PostCSS, a CSS preprocessor.
    *   **Details**: Specifies `tailwindcss` and `autoprefixer` as PostCSS plugins.
*   **`components.json`**:
    *   **Purpose**: Configuration file for Shadcn/UI.
    *   **Details**: References the Shadcn/UI schema. Specifies style (`default`), RSC (`false`), `tsx` (`true`). Configures Tailwind integration (path to `tailwind.config.ts`, main CSS file `src/index.css`, base color `slate`, CSS variables enabled). Defines aliases for resolving component paths (`@/components`, `@/lib/utils`, etc.).
*   **`eslint.config.js`**:
    *   **Purpose**: Configuration file for ESLint, the JavaScript/TypeScript linter, using the new flat config format.
    *   **Details**: Ignores the `dist` directory. Extends recommended ESLint and TypeScript-ESLint rules. Applies to `*.{ts,tsx}` files. Configures browser globals, ECMAScript 2020. Enables plugins: `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`. Custom rules: `react-refresh/only-export-components` set to "warn", `@typescript-eslint/no-unused-vars` turned "off".
*   **`index.html`**:
    *   **Purpose**: The main HTML entry point for the single-page application (SPA).
    *   **Details**: Sets document language, viewport for responsive behavior (disabling user scaling). Title: "Aparie - Master Any Subject with Flashcards". Meta tags for description, author, PWA features (`theme-color`, `apple-mobile-web-app-capable`), iOS splash screens, and Open Graph tags. Links to `aparie-logo.png` for favicons. Contains the root div `<div id="root"></div>` where the React app is mounted. Includes a script for `gptengineer.js` and the main application bundle `/src/main.tsx`.
*   **`bun.lockb`**:
    *   **Purpose**: Binary lock file for the Bun JavaScript runtime and package manager. Ensures reproducible dependency installations if using Bun.
*   **`capacitor.config.ts`**:
    *   **Purpose**: Configuration file for Capacitor, used to build native mobile versions (iOS/Android) of the web app.
    *   **Details**: Defines `appId`, `appName` ("Aparie"), `webDir` ("dist"). Server URL points to a `lovableproject.com` domain. Contains iOS-specific settings (content inset, preferred orientation "portrait", location permissions) and Android-specific settings (AndroidX enabled). Configures Capacitor plugins: `Keyboard` (resize behavior), `SplashScreen` (duration, icon), `StatusBar` (style), `LocalNotifications` (icon color), `Device`, and `App` (status bar visibility).
*   **`build-helper.js`**:
    *   **Purpose**: A Node.js script for pre-build tasks.
    *   **Details**: Executes `npx update-browserslist-db@latest` to update the browserslist database, which is used by tools like Autoprefixer and Babel to determine browser compatibility.
*   **`.gitignore`**:
    *   **Purpose**: Specifies intentionally untracked files that Git should ignore.
    *   **Details**: Includes common ignores for logs, `node_modules`, build output (`dist`, `dist-ssr`), local environment files (`*.local`), and editor/OS-specific files (e.g., `.vscode/`, `.idea/`, `.DS_Store`).

---

## `public/` Directory: Static Assets

This directory contains static assets that are served directly by the web server.

*   **`robots.txt`**:
    *   **Purpose**: Provides instructions for web crawlers (e.g., search engine bots).
    *   **Details**: Allows all major bots (Googlebot, Bingbot, Twitterbot, facebookexternalhit) and other crawlers full access (`Allow: /`) to the site, indicating it\'s intended to be fully indexable.
*   **`favicon.ico`**:
    *   **Purpose**: Standard favicon file in ICO format.
*   **`manifest.json`**:
    *   **Purpose**: Web App Manifest file for Progressive Web App (PWA) features.
    *   **Details**: Defines app `name` ("Aparie - Master Any Subject with Flashcards"), `short_name` ("Aparie"), `description`, `start_url` ("/"), `display` ("standalone"), `background_color`, `theme_color` (matching app theme), `orientation` ("portrait"), and icons (using `aparie-logo.png`).
*   **`placeholder.svg`**:
    *   **Purpose**: An SVG image, likely used as a generic placeholder within the application.
*   **`aparie-logo.png`**:
    *   **Purpose**: The primary logo for the Aparie application in PNG format. Used for favicons, PWA icons, iOS touch icons, and potentially within the app UI.
*   **`aparie-logo.svg`**:
    *   **Purpose**: An SVG (vector) version of the Aparie logo.

---

## `supabase/` Directory: Supabase Backend Configuration

This directory holds configuration and server-side functions for the Supabase backend.

*   **`config.toml`**:
    *   **Purpose**: Supabase project-level configuration.
    *   **Details**: Contains the `project_id` ("khtlezzcdjahvqaflgvk"), linking the local Supabase development environment (if used with Supabase CLI) to the remote Supabase project.
*   **`functions/`**:
    *   **Purpose**: Directory for Supabase Edge Functions (serverless functions).
    *   **`functions/feedback/index.ts`**:
        *   **Purpose**: A Deno-based Supabase Edge Function to handle user feedback submissions.
        *   **Details**:
            *   Handles CORS requests.
            *   Initializes Supabase client using service role key (from environment variables).
            *   Implements rate limiting for submissions and webhook calls.
            *   Provides input sanitization for feedback text.
            *   **Feedback Submission**: Receives `feedback` and `systemInfo` from the client. Creates a new thread in a specified Discord channel (using `DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID` from environment variables). Stores the feedback, system info, and Discord thread ID in the Supabase `feedback` table. Posts the feedback details to the Discord thread.
            *   **Webhook (`/webhook`)**: An endpoint to receive replies (e.g., from Discord), authenticated by a shared secret (`LOVABLE_SHARED_SECRET`). Stores replies in the `feedback_replies` table, linking them to the original feedback.
            *   Uses Deno standard libraries and Supabase client.

---

## `src/` Directory: Application Source Code

This is the heart of the frontend application, containing all React components, pages, hooks, services, and styles.

*   **`App.css`**:
    *   **Purpose**: CSS file with styles that seem to be from an older Vite/React template.
    *   **Details**: Contains styles for `#root`, `.logo` (including hover effects and a spin animation), `.card`, and `.read-the-docs`. Many of these might be overridden by Tailwind CSS or unused.
*   **`App.tsx`**:
    *   **Purpose**: The main root component of the React application.
    *   **Details**:
        *   Sets up global context providers: `QueryClientProvider` (for TanStack React Query), `BrowserRouter` (for React Router DOM), custom `AuthProvider` (from `@/context/auth`), custom `DeckProvider` (from `@/context/DeckContext`), and `TooltipProvider` (from Shadcn/UI).
        *   Renders two toaster components: `<Toaster />` (Shadcn/UI default) and `<Sonner />` (likely Sonner library).
        *   Defines all application routes using `<Routes>` and `<Route>` from `react-router-dom`, mapping paths to page components (e.g., `/` to `Index`, `/auth` to `Auth`, `/dashboard` to `Dashboard`, `/deck/:id` to `DeckEdit`, etc.). Includes a catch-all `NotFound` page.
*   **`env-setup.js`**:
    *   **Purpose**: Another Node.js script (similar to `build-helper.js`) for pre-build tasks.
    *   **Details**: Updates the `browserslist` database by running `npx update-browserslist-db@latest`.
*   **`index.css`**:
    *   **Purpose**: Main global stylesheet for the application.
    *   **Details**:
        *   Imports Tailwind CSS base, components, and utilities (`@tailwind base;` etc.).
        *   Defines CSS custom properties (variables) for theming in `@layer base` for both light (`:root`) and dark (`.dark`) modes. These variables control colors (background, foreground, primary, secondary, accent, destructive, card, popover, border, input, ring) and border radius. Specific variables for a `sidebar` theme are also included. These variables are used by Shadcn/UI and Tailwind.
        *   Applies base styles: default border to all elements, default background/text color to `body`. Includes `font-feature-settings` and a fix for 100vh issue on mobile browsers.
        *   Adds styles for larger tap targets on iOS (`.ios-device`).
        *   Defines utility classes for safe area padding (`.safe-top`, `.safe-bottom`, etc.) using `env(safe-area-inset-*)`.
        *   Includes a `float` animation and responsive helper classes (`.iphone-se`).
        *   Contains iOS-specific CSS adjustments (e.g., `-webkit-tap-highlight-color: transparent`).
*   **`main.tsx`**:
    *   **Purpose**: The entry point for the React application, executed by `index.html`.
    *   **Details**: Imports `React`, `createRoot` (React 18), the main `App` component, and `index.css`. It finds the `<div id="root">` element and renders the `App` component (wrapped in `React.StrictMode`) into it.
*   **`vite-env.d.ts`**:
    *   **Purpose**: TypeScript declaration file for Vite-specific environment variables and client types.
    *   **Details**: Contains `/// <reference types="vite/client" />` to provide type information for `import.meta.env` and other Vite client APIs.

### `src/components/` Subdirectory: Reusable UI Components

Organized by feature or common UI elements.

*   **`components/auth/`**: Authentication related UI.
    *   `AuthForm.tsx`: Potentially a wrapper for login/signup or a base form.
    *   `LoginForm.tsx`: Component for the user login form, handling input, validation, and submission.
    *   `SignupForm.tsx`: Component for the user registration form.
*   **`components/dashboard/`**: Components for the user dashboard.
    *   `CreateDeckButton.tsx`: Button/modal to initiate new deck creation.
    *   `DeckCard.tsx`: Displays a summary of a single deck.
    *   `DeckGrid.tsx`: Arranges multiple `DeckCard`s in a grid.
    *   `FindDeckForm.tsx`: Form to search/find decks.
*   **`components/deck/`**: Components for creating, editing, and managing decks and their cards.
    *   `CardDialog.tsx`: Dialog for adding/editing a flashcard.
    *   `CardForm.tsx`: Form within `CardDialog.tsx` for card details.
    *   `CardList.tsx`: Displays a list of cards in a deck for management.
    *   `DeckEditForm.tsx`: Form for editing deck details (title, description).
    *   `DeckCardManager.tsx`: Orchestrates card management within the deck edit view.
    *   Subdirectories: `card-form/`, `edit/`, `share/` (for UI related to sharing a deck).
*   **`components/feedback/`**: Components for the user feedback system.
    *   `FeedbackButton.tsx`: Button to open the feedback dialog.
    *   `FeedbackDialog.tsx`: Dialog with a form to submit feedback (interacts with the `feedback` Supabase function).
*   **`components/layout/`**: Components for overall page structure.
    *   `Header.tsx`: Application header/navigation bar (logo, nav links, user profile, theme toggle).
    *   `Layout.tsx`: Primary layout component wrapping page content, may include `Header`.
*   **`components/practice/`**: Components for the flashcard practice and test experience.
    *   `FlashcardDisplay.tsx`: Core component for displaying flashcards, handling flips and user answers. Uses animations like `card-flip`.
    *   `GameHeader.tsx`: Header for the practice/test session.
    *   `GameLayout.tsx`: Overall layout for the practice/test screen.
    *   `ProgressBar.tsx`: Visual progress indicator.
    *   `SummaryActions.tsx`: Buttons for the summary screen (e.g., "Practice Again").
    *   `SummaryHeader.tsx`: Header for the summary screen.
    *   `SummaryIncorrectList.tsx` / `SummaryIncorrectSection.tsx`: Displays incorrectly answered cards.
    *   `SummaryStatsCard.tsx` / `SummaryStatsGrid.tsx`: Displays practice statistics.
    *   `SummaryView.tsx`: Main component for the post-practice summary.
*   **`components/shared-deck/`**: Components for viewing/interacting with decks shared by others.
    *   `SharedDeckActions.tsx`: Actions for a shared deck (e.g., "Start Practice", "Save to My Decks").
    *   `SharedDeckDetails.tsx`: Displays information about the shared deck.
    *   `SharedDeckHeader.tsx`: Header for the shared deck view.
    *   `SharedDeckPreview.tsx`: Preview of shared deck content.
*   **`components/ui/`**:
    *   **Purpose**: Contains UI primitives and components, primarily from Shadcn/UI, and potentially custom base UI elements.
    *   **Details**: Based on `package.json` and `components.json`, this directory would house files like `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `toast.tsx` (from Shadcn Toaster), `sonner.tsx` (for Sonner toasts), `tooltip.tsx`, etc. Each file exports a React component styled with Tailwind CSS, forming the building blocks of the application\'s interface.

### `src/context/` Subdirectory: React Context API Providers

For managing global state.

*   **`context/auth/`**: Authentication-related context.
    *   `AuthProvider.tsx`: The main provider component managing user session, authentication status, login/logout functions.
    *   `index.ts`: Exports `AuthProvider` and related items.
    *   `hooks.ts`: Likely contains a `useAuth` custom hook to easily access auth state and functions.
    *   `types.ts`: TypeScript definitions for auth state, user objects.
    *   `utils.ts`: Utility functions specific to authentication.
*   **`DeckContext.tsx`**:
    *   **Purpose**: Defines `DeckProvider` and related context for managing global state concerning flashcard decks.
    *   **Details**: Could manage the list of user\'s decks, the currently active/selected deck, or functions to modify deck data that need to be accessible across various components (e.g., after creating or deleting a deck).

### `src/hooks/` Subdirectory: Custom React Hooks

For reusable stateful logic and side effects.

*   **`use-toast.ts`**: Custom hook for triggering toast notifications (likely an abstraction over Shadcn/UI\'s `useToast` or Sonner). Its size suggests it might be the direct Shadcn/UI `useToast` implementation.
*   **`use-mobile.tsx`**: Hook to detect if the application is running on a mobile device (e.g., by checking screen width or user agent). Used for conditional rendering or applying mobile-specific styles.
*   **`useDeckStorage.ts`**: Hook for managing the storage and retrieval of deck data. Might interact with local storage for unsaved changes or with Supabase for persistent storage.
*   **`useFavorites.ts`**: Hook for managing a user\'s list of favorite decks (adding, removing, checking status).
*   **`useFollowedDecks.ts`**: Hook for managing decks that a user "follows" or has saved from shared links.
*   **`useGameMode.ts` / `useSharedGameMode.ts`**: Hooks to manage the state and logic for practice/test sessions (for user's own decks and shared decks respectively). This includes current card index, score, user answers, timing, etc.
*   **`useSharedDeck.ts`**: Hook to fetch and manage data for a specific shared deck when accessed via a share code.
*   **`useSharing.ts`**: Hook to handle logic related to sharing decks, such as generating unique share codes or updating deck sharing status in Supabase.
*   Subdirectories `deck/` and `game/` may contain more granular, feature-specific hooks.

### `src/integrations/` Subdirectory: Third-Party Service Integrations

*   **`integrations/supabase/`**: Code for client-side interaction with Supabase.
    *   `client.ts`: Initializes and exports the Supabase JavaScript client. Uses environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) for Supabase project URL and public anon key. This client is used for frontend database operations, authentication, and subscriptions.
    *   `types.ts`: Contains TypeScript type definitions generated from (or manually mirroring) the Supabase database schema. This provides type safety for data fetched from and sent to Supabase. Its large size (11KB) indicates comprehensive typing.

### `src/lib/` Subdirectory: Core Utility Functions

*   **`lib/utils.ts`**:
    *   **Purpose**: General utility functions, often including the `cn` function from Shadcn/UI.
    *   **Details**: The `cn` function is a helper for conditionally merging Tailwind CSS class names, typically using `clsx` and `tailwind-merge` libraries. Essential for building dynamic and maintainable styles with Tailwind and Shadcn/UI.

### `src/mappers/` Subdirectory: Data Transformation Logic

*   **`CardMapper.ts`**: Contains functions to transform flashcard data between different formats (e.g., from Supabase API response to the application\'s internal `Card` type, or vice-versa).
*   **`DeckMapper.ts`**: Similar to `CardMapper.ts`, but for deck data. Ensures that data structures used by the frontend are consistent and decoupled from the backend schema.

### `src/pages/` Subdirectory: Top-Level Route Components

These components are rendered by React Router for specific URL paths.

*   **`Index.tsx`**: The landing page of the application.
*   **`Auth.tsx`**: Page that likely embeds authentication forms (`LoginForm`, `SignupForm`) for user login and registration.
*   **`Dashboard.tsx`**: The main page users see after logging in. Displays their decks (using `DeckGrid`, `DeckCard`) and provides actions like creating new decks.
*   **`DeckEdit.tsx`**: Page for creating a new deck or editing an existing one. Uses components like `DeckEditForm` for deck details and `CardList`/`CardDialog` for managing cards within the deck.
*   **`Practice.tsx`**: Page where users practice a selected deck using the flashcard interface (`GameLayout`, `FlashcardDisplay`).
*   **`Test.tsx`**: Similar to `Practice.tsx`, but for a "test" mode, which might have different scoring, timing, or interaction logic.
*   **`DeckShare.tsx`**: Page where users can manage sharing settings for their decks (e.g., generate share codes, set permissions).
*   **`SharedDeck.tsx`**: Page displayed when a user accesses a shared deck via a link/code. Uses components from `src/components/shared-deck/` to display deck details and actions.
*   **`SharedDeckPractice.tsx`**: Interface for practicing a shared deck.
*   **`SharedDeckTest.tsx`**: Interface for testing on a shared deck.
*   **`NotFound.tsx`**: A simple page displayed for any invalid URLs (404 error).

### `src/services/` Subdirectory: Business Logic and API Interactions

Modules responsible for handling application logic and communication with the backend (Supabase).

*   **`answerGenerationService.ts`**:
    *   **Purpose**: Service that might interact with an AI or heuristics for flashcard-related tasks.
    *   **Details**: Could be used for automatically generating answers, providing suggestions for card content, or implementing more flexible answer checking during practice.
*   **`cardOperationsService.ts`**:
    *   **Purpose**: Contains functions for CRUD (Create, Read, Update, Delete) operations on individual cards within a deck.
    *   **Details**: Functions like `addCardToDeck`, `updateCardInDeck`, `deleteCardFromDeck`. Interacts with the Supabase client to persist these changes.
*   **`deckOperationsService.ts`**:
    *   **Purpose**: Contains functions for CRUD operations on entire decks.
    *   **Details**: Functions like `createDeck`, `getDeckById`, `getUserDecks`, `updateDeckDetails`, `deleteDeck`. Interacts with Supabase.
*   **`deckService.ts`**:
    *   **Purpose**: Might be a more general service related to decks or an older version. `deckOperationsService.ts` seems to be the primary one given its size and typical naming.
*   **`deckSharingService.ts`**:
    *   **Purpose**: Handles backend interactions for deck sharing.
    *   **Details**: Functions for creating unique share codes for decks, fetching shared deck data by its code, and potentially managing sharing permissions or public visibility in Supabase.
*   **`favoriteService.ts`**:
    *   **Purpose**: Manages adding/removing decks from a user\'s favorites list.
    *   **Details**: Interacts with a Supabase table that links users to their favorited decks.
*   **`followedDeckService.ts`**:
    *   **Purpose**: Manages decks that a user "follows" or has saved from shared links.
    *   **Details**: Similar to `favoriteService`, likely involves storing a relationship between the user and the shared deck ID in Supabase.
*   **`shareService.ts`**:
    *   **Purpose**: May provide client-side utilities or orchestrate sharing-related API calls, complementing `deckSharingService.ts`.

### `src/types/` Subdirectory: Custom TypeScript Definitions

Contains custom TypeScript type definitions used throughout the frontend application.

*   **`cardOperations.ts`**: Defines types related to card operations, such as arguments for service functions or the structure of card data during editing.
*   **`deck.ts`**: Defines the primary `Deck` and `Card` object structures as used within the application\'s frontend logic. This might include client-side state (e.g., `isFlipped` for a card) or properties not directly mapped in the database schema.
*   **`game.ts`**: Defines types related to the practice/test game state, such as `GameScore`, `UserAnswer`, `CardAttempt`, or the overall state object for `useGameMode` hook.

---

This document should serve as a good starting point for understanding the Aparie codebase. 