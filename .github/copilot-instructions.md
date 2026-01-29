# GitHub Copilot Instructions

## Project Structure Rules

### Feature-Based Organization
Organize code by feature within Laravel's standard folders:

```
app/
├── Models/[Feature]/          # Eloquent models grouped by feature
├── Http/Controllers/[Feature]/ # Controllers grouped by feature
├── Services/[Feature]/        # Business logic services
├── Repositories/[Feature]/    # Query-only repositories
├── Contracts/[Feature]/       # Interfaces for dependency injection
├── Events/[Feature]/          # Domain events
├── Jobs/[Feature]/            # Background jobs
├── Strategies/[Feature]/      # Strategy pattern implementations
├── Factories/[Feature]/       # Factory pattern implementations
└── Console/Commands/[Feature]/ # Artisan commands
```

### Current Features
- **Webhook**: Webhook testing and replay system

### Namespace Convention
Follow PSR-4 autoloading with feature grouping:
- `App\Models\Webhook\WebhookEndpoint`
- `App\Http\Controllers\Webhook\WebhookEndpointController`
- `App\Services\Webhook\WebhookEndpointService`
- `App\Repositories\Webhook\WebhookEndpointRepository`
- `App\Contracts\Webhook\WebhookLoggerInterface`

## Architecture Patterns

### Repository Pattern (Query Only)
Repositories MUST only contain read operations:
```php
// ✅ CORRECT
public function findByUuid(string $uuid): ?WebhookEndpoint;
public function getAllActive(): Collection;
public function getPaginatedByEndpoint(int $endpointId, int $perPage = 50);

// ❌ WRONG - No write operations in repositories
public function create(array $data);
public function update(Model $model, array $data);
public function delete(Model $model);
```

### Service Pattern (Business Logic + Writes)
Services contain all business logic and write operations:
```php
// ✅ CORRECT - Services handle creates, updates, deletes
public function createEndpoint(array $data): WebhookEndpoint;
public function updateEndpoint(WebhookEndpoint $endpoint, array $data): WebhookEndpoint;
public function deleteEndpoint(WebhookEndpoint $endpoint): bool;
public function logRequest(WebhookEndpoint $endpoint, Request $request): WebhookRequest;
```

### Controller Pattern (Thin HTTP Layer)
Controllers MUST remain thin - only handle HTTP concerns:
```php
// ✅ CORRECT - Delegate to services
public function store(Request $request)
{
    $validated = $request->validate([...]);
    $endpoint = $this->endpointService->createEndpoint($validated);
    return response()->json($endpoint, 201);
}

// ❌ WRONG - No business logic in controllers
public function store(Request $request)
{
    $endpoint = new WebhookEndpoint();
    $endpoint->name = $request->name;
    $endpoint->uuid = Str::uuid();
    // ... more logic
}
```

## SOLID Principles

### Dependency Injection
Always use constructor injection with interfaces:
```php
public function __construct(
    private WebhookLoggerInterface $logger,
    private WebhookReplayerInterface $replayer
) {}
```

### Interface Segregation
Create focused interfaces in `Contracts/[Feature]/`:
- `WebhookLoggerInterface` - logging concerns
- `WebhookReplayerInterface` - replay concerns
- `HttpClientInterface` - HTTP client abstraction
- `ReplayStrategyInterface` - replay strategies

### Single Responsibility
- Models: Data representation + relationships only
- Controllers: HTTP request/response handling
- Services: Business logic + orchestration
- Repositories: Database queries
- Jobs: Background task execution
- Events: Domain event broadcasting

## Naming Conventions

### Files
- Models: `{Entity}.php` (e.g., `WebhookEndpoint.php`)
- Controllers: `{Entity}Controller.php` (e.g., `WebhookEndpointController.php`)
- Services: `{Entity}Service.php` (e.g., `WebhookEndpointService.php`)
- Repositories: `{Entity}Repository.php` (e.g., `WebhookEndpointRepository.php`)
- Interfaces: `{Purpose}Interface.php` (e.g., `WebhookLoggerInterface.php`)
- Events: `{Action}Event.php` (e.g., `WebhookReceivedEvent.php`)
- Jobs: `{Action}Job.php` (e.g., `ProcessWebhookReplayJob.php`)

### Methods
- Repository queries: `find*`, `get*`, `count*`, `exists*`
- Service writes: `create*`, `update*`, `delete*`, `process*`
- Service reads: delegate to repository
- Controllers: `index`, `store`, `show`, `update`, `destroy`

## Database Conventions

### Migrations
- Prefix with date: `2026_01_10_100000_create_webhook_endpoints_table.php`
- Use descriptive names
- Add indexes for foreign keys and frequently queried columns

### Models
```php
// Always specify fillable or guarded
protected $fillable = ['name', 'url', 'secret'];

// Use casting for JSON and dates
protected $casts = [
    'headers' => 'array',
    'expires_at' => 'datetime',
    'is_active' => 'boolean',
];

// Define relationships
public function requests(): HasMany
{
    return $this->hasMany(WebhookRequest::class, 'endpoint_id');
}
```

## Code Quality Rules

### Type Declarations
Always use strict types and return type declarations:
```php
declare(strict_types=1);

public function createEndpoint(array $data): WebhookEndpoint
{
    // ...
}
```

### Validation
- Validate in controllers using FormRequest or inline validation
- Never trust user input
- Use Laravel's validation rules

### Error Handling
- Throw specific exceptions
- Use try-catch in controllers
- Return appropriate HTTP status codes

### Testing
- Write tests in `tests/Feature/` and `tests/Unit/`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies

## When Adding New Features or Refactoring

### Pre-Development Review (MANDATORY)
Before starting any feature development or refactoring, **MUST** review the specific functionality:

1. **Define Scope & Responsibilities**
   - What exact functionality does this feature/refactor provide?
   - Which components/layers does it affect?
   - What are the integration points?

2. **Verify Architecture**
   - Does it follow the repository/service/controller pattern?
   - Are there any existing patterns to follow?
   - Is the feature-based organization appropriate?

3. **Check Existing Code**
   - Are there similar features already implemented?
   - Can we reuse existing utilities, hooks, or components?
   - Should this be shared or feature-specific?

4. **Plan File Structure**
   - Create all necessary folders in advance
   - Map out which interfaces/contracts are needed
   - Identify shared vs feature-specific code

### Implementation Steps

1. **Create folder structure**: `app/Models/[Feature]/`, `app/Services/[Feature]/`, etc.
2. **Define contracts**: Create interfaces in `app/Contracts/[Feature]/`
3. **Implement models**: Add to `app/Models/[Feature]/`
4. **Create repositories**: Query-only in `app/Repositories/[Feature]/`
5. **Create services**: Business logic in `app/Services/[Feature]/`
6. **Add controllers**: Thin HTTP layer in `app/Http/Controllers/[Feature]/`
7. **Register bindings**: Update service provider
8. **Define routes**: Add to `routes/api.php` or `routes/web.php`
9. **Create migrations**: Database schema changes
10. **Write tests**: Feature and unit tests

## Frontend (React + Inertia.js)

### Component Organization
```
resources/js/
├── Pages/[Feature]/     # Inertia pages
├── Components/[Feature]/ # Reusable components
├── components/ui/       # Shadcn/ui components (use directly)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities (cn, toUrl)
└── types/               # TypeScript types
```

### Naming
- Pages: PascalCase (e.g., `Index.jsx`, `Create.jsx`)
- Components: PascalCase (e.g., `WebhookForm.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useWebhookLogs.js`)

### When Adding New Pages

When creating a new page/screen, **MUST** complete these required tasks:

1. **Create the page component** in `resources/js/pages/[Feature]/`
2. **Add route** in backend (`routes/web.php` or `routes/api.php`)
3. **Configure menu** in navigation structure:
   - Update `resources/js/components/nav-main.tsx` or relevant navigation file
   - Add menu item with proper icon and label
   - Ensure menu visibility reflects user permissions

4. **Setup permissions/authorization** (if applicable):
   - Define permissions in backend (e.g., `view-webhook`, `create-webhook`)
   - Add permission checks in controller before returning page
   - Hide/show menu items based on user permissions using `canViewPage()` or similar
   - Control component visibility based on permissions

✅ **CORRECT** - Complete page setup:
```tsx
// 1. Create page
// resources/js/pages/Webhook/Index.tsx
export function Index() {
  return <div>Webhook List</div>;
}

// 2. Add route in routes/web.php
Route::middleware('auth')->group(function () {
  Route::get('/webhooks', [WebhookController::class, 'index'])->name('webhooks.index');
});

// 3. Add to menu navigation
// resources/js/components/nav-main.tsx
const menuItems = [
  {
    title: 'Webhooks',
    url: '/webhooks',
    icon: HookIcon,
    isActive: currentPath.startsWith('/webhooks'),
    // Only show if user has permission
    visible: user.can('view-webhooks'),
  },
];

// 4. Setup permissions in controller
public function index()
{
    $this->authorize('view-webhooks');
    return Inertia::render('Webhook/Index', [
        'webhooks' => $this->webhookRepository->getAllActive(),
    ]);
}
```

❌ **WRONG** - Incomplete page setup:
```tsx
// Only creating the page without menu config and permissions
export function Index() {
  return <div>Webhook List</div>;
}
```

### UI Component Usage Rules

#### Priority: Use Existing UI Components
**ALWAYS prioritize using existing components from `components/ui/` before creating new ones:**

Available UI Components:
- **Layouts**: `AppShell`, `AppHeader`, `AppSidebar`, `AppContent`, `SidebarInset`
- **Forms**: `Input`, `Select`, `Checkbox`, `Toggle`, `Label`, `InputOTP`
- **Display**: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Skeleton`
- **Navigation**: `NavigationMenu`, `Breadcrumbs`, `NavMain`, `NavUser`
- **Feedback**: `Alert`, `AlertError`, `Dialog`, `Sheet`, `Tooltip`
- **Interactive**: `Button`, `ToggleGroup`, `Dropdown Menu`, `Collapsible`
- **Other**: `Separator`, `Avatar`, `Icon`, `Spinner`, `PlaceholderPattern`

✅ **CORRECT** - Use existing Button component:
```tsx
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return <Button variant="primary" size="default">Click me</Button>;
}
```

❌ **WRONG** - Don't create custom button styles:
```tsx
export function MyComponent() {
  return <button className="custom-button-styles">Click me</button>;
}
```

#### Responsive Design Requirements
- **MUST use Tailwind responsive classes**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **MOBILE-FIRST approach**: Default styles for mobile, add breakpoints for larger screens
- **Minimum mobile padding**: `p-4` (16px) on small screens
- **Test on all breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px+)

✅ **CORRECT** - Mobile-first responsive design:
```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-6 lg:p-8">
  <Card className="w-full">...</Card>
</div>
```

❌ **WRONG** - No responsive behavior:
```tsx
<div className="grid grid-cols-3 gap-8 p-8">
  <Card>...</Card>
</div>
```

#### Consistent Spacing Rules
Use Tailwind's spacing scale consistently - **NO arbitrary spacing**:

**Standard Gaps Between Components:**
- `gap-2` - Tight grouping (8px)
- `gap-4` - Normal spacing (16px) - **DEFAULT for most cases**
- `gap-6` - Generous spacing (24px) - **For sections and cards**

**Standard Padding:**
- `p-4` - Mobile default (16px)
- `p-6` - Desktop default (24px)
- `px-4 py-3` - Input/Button padding (internal consistency)

**Card/Section Structure:**
```tsx
// Main content area
<main className="mx-auto max-w-7xl flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">

// Card spacing
<Card className="gap-6">
  <CardHeader className="px-6">...</CardHeader>
  <CardContent className="px-6">...</CardContent>
</Card>

// Grid layouts
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-6">
```

#### Component Composition Pattern
Always use compound components when available:

✅ **CORRECT** - Use Card compound components:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>Content here</CardContent>
    </Card>
  );
}
```

#### Color & Styling
- Use semantic color variables: `text-primary`, `bg-card`, `border-input`
- Apply classes using `cn()` utility for combining styles
- Avoid hardcoded colors - use Tailwind theme colors

### Feature & Config Reusability

#### Global Configuration Priority
When creating features or configuration that:
- Are used in multiple files/components
- Have shared logic or state
- Are referenced across features

**MUST create in shared locations:**

1. **Utilities & Constants** → `resources/js/lib/utils.ts`
2. **Custom Hooks** → `resources/js/hooks/use-{feature}.ts`
3. **Types & Interfaces** → `resources/js/types/`
4. **Shared Components** → `resources/js/components/` (without feature subfolder)

#### Example: Creating Reusable Date Formatter
❌ **WRONG** - Repeated logic across components:
```tsx
// components/Dashboard.tsx
const formatDate = (date) => new Date(date).toLocaleDateString();

// components/Reports/Index.tsx
const formatDate = (date) => new Date(date).toLocaleDateString();
```

✅ **CORRECT** - Centralized in utils:
```tsx
// lib/utils.ts
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US');
}

// components/Dashboard.tsx
import { formatDate } from '@/lib/utils';

// components/Reports/Index.tsx
import { formatDate } from '@/lib/utils';
```

#### Example: Shared Hook for Features
✅ **CORRECT** - Feature with reusable logic in hook:
```tsx
// hooks/useWebhookLogs.ts - Reusable across all Webhook components
export function useWebhookLogs(endpointId: number) {
  const [logs, setLogs] = useState([]);
  // Shared logic here
  return { logs, loading };
}

// components/WebhookLogs.tsx
import { useWebhookLogs } from '@/hooks/useWebhookLogs';

// pages/webhook/Detail.tsx
import { useWebhookLogs } from '@/hooks/useWebhookLogs';
```

#### Example: Shared Context for Cross-Feature State
When state is used across multiple features:

✅ **CORRECT** - Context at root level:
```tsx
// Create context once
// hooks/useAppContext.ts
export const AppContext = createContext();

// Use in multiple places
import { useAppContext } from '@/hooks/useAppContext';
```

### Service Provider Pattern
Register shared utilities and hooks in service providers or initialization:

```php
// app/Providers/AppServiceProvider.php
// Register global React contexts or shared utilities here
```

## Environment

- **Backend**: Laravel 11+ with PHP 8.2+
- **Frontend**: React 18 with Vite
- **Queue**: Redis
- **Broadcasting**: Laravel Reverb/Pusher
- **Database**: MySQL 8.0+

### Docker Container Setup

This project runs inside a Docker container (FrankenPHP) at `/app/spend-wise`. Always execute commands within the container:

**Container Details:**
- **Container Name**: `frankenphp`
- **Working Directory**: `/app/spend-wise`
- **Source Host Path**: `/home/htnghia/Sources/spend-wise`

**Running Commands:**
```bash
# PHP/Laravel commands
docker exec -it frankenphp php artisan [command]
docker exec -it frankenphp composer [command]

# NPM/Node commands
docker exec -it frankenphp npm [command]
docker exec -it frankenphp npm run dev
docker exec -it frankenphp npm run build

# Database migrations
docker exec -it frankenphp php artisan migrate

# Cache clearing
docker exec -it frankenphp php artisan optimize:clear
```

**DO NOT run commands directly on host machine** - always use `docker exec -it frankenphp` prefix.

**Common Docker Operations:**
```bash
# Enter container shell
docker exec -it frankenphp bash

# View logs
docker logs frankenphp -f

# Restart container
docker restart frankenphp
```

## Best Practices

1. **Follow PSR-12** coding standards
2. **Use dependency injection** over facades when possible
3. **Keep methods small** - max 20 lines
4. **Write descriptive names** - clarity over brevity
5. **Comment complex logic** but write self-documenting code
6. **Use type hints** everywhere
7. **Avoid magic numbers** - use constants
8. **Prefer composition** over inheritance
9. **Make classes final** unless designed for extension
10. **Use readonly properties** where appropriate (PHP 8.1+)

## Documentation Rules

- **DO NOT create documentation files** unless explicitly requested by user
- **DO NOT create markdown files** to summarize changes or document features
- Code should be self-documenting with clear naming and inline comments when needed
- Focus on implementation, not documentation
