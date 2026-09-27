# 🚀 Production-Level Todo SaaS Application

Build a **production-level Todo SaaS web application** using **ONLY vanilla HTML, CSS, and JavaScript**. The application should feel like a **real, premium productivity SaaS product**, not a beginner Todo CRUD project.

---

## ⚠️ Strict Technology Requirements

The project must use only:

- HTML5
- Modern CSS3
- Vanilla JavaScript ES6+

### Do NOT use

- React
- Next.js
- Vue
- Angular
- Svelte
- TypeScript
- Tailwind CSS
- Bootstrap
- jQuery
- Node.js
- Express
- Vite
- Webpack
- Any frontend framework
- Any CSS framework
- Any backend
- Any database
- Firebase
- Supabase
- External authentication services
- External APIs unless absolutely required for a non-core visual feature

The application must work directly in a modern browser. There should be **no npm installation or build process required**.

The project should be runnable by opening:

```
index.html
```

in a modern browser.

---

# 🎯 Product Vision

Create a complete Todo productivity SaaS experience consisting of:

1. Landing Page
2. Sign Up
3. Login
4. Protected Todo Dashboard
5. Task Creation
6. Task Editing
7. Task Management
8. Search
9. Filtering
10. Sorting
11. Productivity Statistics
12. User Profile
13. Local Storage Persistence

The final product should look like something that could realistically be presented to customers. It should feel:

> **Professional + Modern + Minimal + Premium + Fast + Focused**

---

# 🎨 Design Direction

The visual design is extremely important. Do **NOT** create a generic Todo application. Do **NOT** use the typical:

- Lemon color
- Lime color
- Yellow-green color
- Neon colors
- Childish colors
- Excessive gradients
- Excessive glassmorphism

Use a sophisticated professional color palette.

### Recommended Color Direction

Use a combination of:

- Deep navy
- Slate
- White / off-white
- Cool gray
- Blue
- Indigo
- Violet

Use subtle colors for:

- Success
- Warning
- Error
- Priority

The exact colors are up to you, but they must look cohesive and professional.

---

# 🧩 Design System

Before building the UI, establish a consistent design system. Create CSS custom properties for:

- Primary colors
- Secondary colors
- Background
- Surface
- Borders
- Text
- Muted text
- Success
- Warning
- Danger
- Border radius
- Shadows
- Spacing
- Typography

Example:

```css
:root {
  --color-primary: ...;
  --color-primary-hover: ...;
  --color-background: ...;
  --color-surface: ...;
  --color-border: ...;
  --color-text: ...;
  --color-text-muted: ...;
  --color-success: ...;
  --color-warning: ...;
  --color-danger: ...;
  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;
  --shadow-sm: ...;
  --shadow-md: ...;
  --shadow-lg: ...;
}
```

Use these variables consistently throughout the application.

---

# 🏠 1. Landing Page

Create a polished SaaS landing page. The landing page should immediately communicate the value of the Todo application.

---

## Navigation

Include:

- Product logo/name
- Features
- How It Works
- Sign In
- Get Started

Add subtle hover effects. The navigation should be responsive.

---

## Hero Section

Create a strong hero section containing:

- Large headline
- Supporting description
- Primary CTA
- Secondary CTA
- Product preview
- Subtle background decoration

Example direction:

> Plan less.
> Accomplish more.

Do not necessarily use this exact copy. Create polished product-focused copy.

The hero should feel premium and spacious.

---

## Product Preview

Show a realistic preview of the actual Todo dashboard. The preview should contain realistic:

- Task cards
- Statistics
- Filters
- User interface elements

Do not use a generic placeholder image. The preview should visually match the actual application.

---

# ✨ Features Section

Create feature cards for:

- Smart Task Management
- Priorities
- Deadlines
- Search & Filters
- Productivity Overview
- Simple Workflow

Each feature should have:

- Icon
- Title
- Short description

Use subtle hover effects. Avoid excessive visual decoration.

---

# 📝 How It Works

Create a simple three-step section:

### 01 — Create

Create your account and start organizing your work.

### 02 — Organize

Add tasks, priorities, categories, and deadlines.

### 03 — Accomplish

Track progress and complete your work.

Use clean visual indicators for each step.

---

# 🚀 Final CTA

Add a polished final CTA section. Include:

- Strong heading
- Supporting text
- Get Started button

Keep it visually consistent with the rest of the landing page.

---

# 🦶 Footer

Include:

- Product logo
- Product description
- Features
- How It Works
- Login
- Sign Up
- Privacy
- Terms
- Copyright

Keep the footer minimal and professional.

---

# 🔐 2. Authentication

Create professional authentication screens.

---

## Login Page

Include:

- Email
- Password
- Show/hide password
- Remember me
- Forgot password UI
- Login button
- Link to Sign Up
- Validation messages
- Error states
- Loading state
- Success feedback

The page should have a polished SaaS authentication layout.

---

## Sign Up Page

Include:

- Full name
- Email
- Password
- Confirm password
- Password strength indicator
- Terms acceptance
- Create Account button
- Link to Login

Implement client-side validation. Validate:

- Required fields
- Email format
- Password length
- Password confirmation
- Terms acceptance

---

# 💾 3. Authentication Using localStorage

There must be:

**NO backend.**
**NO database.**
**NO Firebase.**
**NO Supabase.**

Use browser `localStorage` for authentication and persistence.

---

## User Storage

Store registered users locally. Example structure:

```json
{
  "id": "unique-id",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "createdAt": "2026-09-27T..."
}
```

Store the currently authenticated user/session separately. Example storage keys:

```
todo_users
todo_current_user
todo_tasks
todo_preferences
```

---

## Important Security Note

This application uses localStorage because there is intentionally no backend. Therefore:

**Do not claim that this authentication system is secure for real-world production authentication.**

Passwords stored in localStorage are not suitable for sensitive real-world authentication. Treat this as a **client-side/demo authentication architecture**.

However, structure the code cleanly so that a real authentication API/backend could replace it later.

---

# 👤 4. Multi-User Local Storage

Tasks must belong to the currently logged-in local user. For example:

```json
{
  "id": "task-123",
  "userId": "user-456",
  "title": "Complete documentation",
  "description": "Finish the product documentation.",
  "priority": "high",
  "category": "Work",
  "dueDate": "2026-10-01",
  "completed": false,
  "createdAt": "2026-09-27T..."
}
```

User A must not see User B's tasks. When a user logs in:

1. Load the current user.
2. Load only that user's tasks.
3. Render their dashboard.
4. Save changes against their user ID.

---

# 🗂️ 5. Storage Architecture

Create a dedicated storage abstraction. Do **not** scatter raw calls like:

```js
localStorage.getItem(...)
localStorage.setItem(...)
```

throughout the application. Create reusable functions such as:

```js
getUsers()
saveUsers(users)
getCurrentUser()
setCurrentUser(user)
clearCurrentUser()
getTasks(userId)
saveTasks(userId, tasks)
getPreferences(userId)
savePreferences(userId, preferences)
```

Handle:

- Missing data
- Invalid JSON
- Empty storage
- Storage errors

Use a consistent storage-key strategy.

---

# 🔒 6. Protected Dashboard

The dashboard must require authentication. Flow:

```
dashboard.html
      ↓
Check authentication
      ↓
Is user logged in?
      ↓
NO ──────────→ login.html
      ↓
YES
      ↓
Load current user
      ↓
Load user's tasks
      ↓
Render dashboard
```

Unauthenticated users should be redirected to Login. Authenticated users should be able to access the dashboard normally.

---

# 📊 7. Todo Dashboard

Create a professional dashboard.

---

## Header

Include:

- Product logo
- Navigation
- Search
- Optional notifications
- User avatar
- User name
- Profile menu
- Logout

The header should remain clean and uncluttered.

---

# 📈 8. Dashboard Statistics

Create beautiful summary cards for:

- Total Tasks
- Active Tasks
- Completed Tasks
- Overdue Tasks

Each card should have:

- Icon
- Number
- Label
- Optional subtle trend/context indicator

Do not make them look like boring admin dashboard boxes.

---

# 🗃️ 9. Task Cards

This is one of the most important requirements.

## DO NOT display tasks as simple rows.

Do not create a basic list such as:

```
☐ Buy groceries
☐ Finish project
☐ Call John
```

Instead, every task should be a professional card. Example:

```
┌──────────────────────────────────────────────┐
│ ○  Finish project documentation        ⋮    │
│                                              │
│    Complete the final product documentation  │
│    before the release deadline.              │
│                                              │
│    HIGH     WORK       Due Tomorrow           │
└──────────────────────────────────────────────┘
```

Each task card should support:

- Completion checkbox
- Task title
- Description
- Priority badge
- Category badge
- Due date
- Edit button
- Delete button

---

# 🎴 10. Task Card Design

Task cards should have:

- Rounded corners
- Subtle border
- Soft shadow
- Proper spacing
- Clear typography
- Strong visual hierarchy
- Professional badges
- Clean alignment

Cards should feel lightweight and premium. Do not over-design them.

---

# 🖱️ 11. Task Hover Effects

Add subtle hover interactions. When the user hovers over a task card:

- Slight upward movement
- Slight shadow increase
- Border color transition
- Smooth transition
- Reveal secondary actions if appropriate

Example:

```css
.task-card {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.task-card:hover {
  transform: translateY(-2px);
}
```

Keep the animation subtle. Do not use bouncing or dramatic movement.

---

# ✅ 12. Task Completion

When a task is completed:

- Animate the checkbox
- Smoothly strike through the title
- Reduce secondary text opacity slightly
- Update statistics
- Persist the change to localStorage

When the task is unchecked, reverse the animation smoothly.

---

# ➕ 13. Add Task

Create a polished Add Task modal or side panel. Fields:

- Task title
- Description
- Priority
- Due date
- Category

Priority options:

- Low
- Medium
- High

Include:

- Validation
- Save button
- Cancel button
- Close button
- Error state
- Success feedback

---

# ✏️ 14. Edit Task

Use the same reusable modal for editing tasks. The user should be able to modify:

- Title
- Description
- Priority
- Due date
- Category

Changes must immediately update the dashboard and localStorage.

---

# 🔍 15. Search

Implement real-time task search using vanilla JavaScript. Search across:

- Task title
- Description
- Category

The task cards should update without reloading the page. Search input should include:

- Search icon
- Clear button
- Focus state
- Smooth interaction

---

# 🏷️ 16. Filtering

Provide filters for:

- All
- Active
- Completed
- Overdue
- High Priority
- Medium Priority
- Low Priority

Filtering should work together with search. For example:

```
Search + Priority Filter + Status Filter
```

should work correctly at the same time.

---

# ↕️ 17. Sorting

Add sorting options:

- Newest
- Oldest
- Due Date
- Priority
- Alphabetical

Implement everything using vanilla JavaScript.

---

# 🕐 18. Due Dates & Overdue Tasks

Tasks should support due dates. Automatically determine whether a task is overdue. An overdue task should have a clear but professional visual indicator. Do not use overly bright or aggressive colors.

---

# 📭 19. Empty States

Create polished empty states. For example:

### No Tasks

> **You're all caught up.**
> Create your first task and start organizing your day.

Button: > **Create Task**

Create different empty states for:

- No tasks
- No search results
- No completed tasks
- No overdue tasks

Do not simply show:

> No tasks found.

---

# 🔔 20. Toast Notifications

Create a reusable vanilla JavaScript toast system. Examples:

- Task created
- Task updated
- Task completed
- Task deleted
- Profile updated
- Logged out

Use subtle animations:

```
Fade In
↓
Slide
↓
Visible
↓
Fade Out
```

Toasts should not block the interface.

---

# ⚠️ 21. Confirmation Dialogs

For destructive actions such as deleting a task, display a professional confirmation dialog. Example:

> **Delete this task?**
>
> This action cannot be undone.

Buttons:

- Cancel
- Delete

The Delete button should use the application's danger color.

---

# 👤 22. User Profile

Create:

```
profile.html
```

Allow users to:

- View their name
- Edit their name
- View their email
- Change preferences
- Logout

Persist profile changes to localStorage.

---

# 📱 23. Responsive Design

The entire application must work beautifully on:

- Large desktop
- Desktop
- Laptop
- Tablet
- Mobile

Do not simply shrink the desktop version.

---

## Mobile Requirements

On mobile:

- Convert navigation into a mobile menu
- Stack statistics cards
- Make task cards full width
- Make filters horizontally scrollable or collapsible
- Use mobile-friendly modals
- Make buttons touch-friendly
- Maintain comfortable spacing
- Prevent horizontal overflow

The mobile version should feel intentionally designed.

---

# 🎬 24. Animation System

Use CSS transitions and vanilla JavaScript. Animations should be:

- Fast
- Smooth
- Subtle
- Consistent
- Purposeful

Use animations for:

- Page elements
- Cards
- Buttons
- Modals
- Checkboxes
- Toasts
- Dropdowns
- Filters
- Task creation/removal

Avoid:

- Excessive bouncing
- Long animations
- Distracting effects
- Animated backgrounds that hurt readability

---

## Reduced Motion

Respect users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# ♿ 25. Accessibility

Use semantic HTML. Include:

- Proper labels
- Accessible buttons
- Keyboard navigation
- Visible focus states
- ARIA attributes where appropriate
- Good color contrast
- Semantic headings
- Accessible modals
- Escape-to-close behavior

Do not sacrifice accessibility for visual design.

---

# 📁 26. Project Structure

Use a clean project structure such as:

```
todo-app/
│
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── profile.html
│
├── css/
│   ├── style.css
│   ├── landing.css
│   ├── auth.css
│   └── dashboard.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── storage.js
│   ├── tasks.js
│   ├── dashboard.js
│   ├── profile.js
│   └── utils.js
│
└── assets/
    └── ...
```

You may adjust the structure if there is a better vanilla JavaScript architecture, but keep it clean and maintainable.

---

# 🧱 27. Code Architecture

Even though this is vanilla JavaScript, maintain professional architecture. Separate:

- UI
- Business logic
- Authentication
- Storage
- Task management
- Dashboard logic
- Utility functions

Avoid giant JavaScript files. Avoid duplicated logic. Use reusable functions. Use meaningful variable and function names. Use ES6+ features where appropriate.

---

# 🚫 28. No Framework Dependencies

The final project must work with:

```
HTML
CSS
JavaScript
```

Nothing else should be required. Prefer **inline SVG icons** instead of adding an icon library.

Do not require:

```
npm install
npm run dev
npm build
```

The application should work directly in the browser.

---

# 🧪 29. Quality Requirements

Before considering the project complete, verify:

- [ ] Landing page works
- [ ] Navigation works
- [ ] Sign Up works
- [ ] Login works
- [ ] Logout works
- [ ] Authentication state persists
- [ ] Dashboard protection works
- [ ] Tasks can be created
- [ ] Tasks can be edited
- [ ] Tasks can be deleted
- [ ] Tasks can be completed
- [ ] Tasks persist after refresh
- [ ] Different users have separate tasks
- [ ] Search works
- [ ] Filters work
- [ ] Sorting works
- [ ] Due dates work
- [ ] Overdue state works
- [ ] Statistics update correctly
- [ ] Profile editing works
- [ ] Toasts work
- [ ] Confirmation dialogs work
- [ ] Empty states work
- [ ] Responsive layout works
- [ ] Keyboard interactions work
- [ ] Reduced-motion preference works

Test the complete user flow.

---

# 🏆 30. Final Product Standard

Do not create a basic Todo CRUD interface and decorate it afterward. Design it as a complete product from the beginning.

The user journey should feel like:

```
Landing Page
      ↓
Sign Up
      ↓
Login
      ↓
Dashboard
      ↓
Create Task
      ↓
Organize Tasks
      ↓
Search / Filter / Sort
      ↓
Complete Tasks
      ↓
Track Productivity
```

Every screen must share the same:

- Design language
- Color system
- Typography
- Spacing
- Components
- Animation style

The final UI should feel:

> **Professional**
> **Modern**
> **Minimal**
> **Premium**
> **Responsive**
> **Fast**
> **Polished**

The **task cards must be one of the strongest visual elements** of the application.

Do not use the lemon/lime color style. Do not make the UI look like a tutorial project. Do not make it look like a generic Bootstrap template.

Build a **premium SaaS Todo application using only vanilla HTML, CSS, and JavaScript with localStorage persistence**.

---

# 🤖 Implementation Instructions

Before writing the code:

1. Analyze the complete requirements.
2. Plan the application architecture.
3. Define the design system.
4. Define the localStorage data model.
5. Define the authentication flow.
6. Define the task data model.
7. Define reusable UI components/functions.
8. Then implement the application.

When implementing:

- Write complete working code.
- Do not provide pseudo-code.
- Do not leave major sections as TODOs.
- Do not replace functionality with placeholders.
- Do not introduce frameworks.
- Do not introduce a backend.
- Do not introduce a database.
- Do not simplify the UI into a basic Todo list.

If you need to make a design decision that is not explicitly specified, choose the option that best matches a **premium, modern productivity SaaS product**.

The final result should be immediately usable in a modern browser.
