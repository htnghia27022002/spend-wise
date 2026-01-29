# Data View Components

This directory contains reusable components for displaying data in different view modes (list and card).

## Components

### CardView

A flexible grid-based card layout component with responsive column support.

**Props:**

- `items`: Array of data items (must have an `id` field)
- `renderItem`: Function that renders each item
- `columns`: Optional object for responsive columns
    - `default`: Number of columns for mobile (default: 1)
    - `sm`: Number of columns for small screens
    - `md`: Number of columns for medium screens (default: 2)
    - `lg`: Number of columns for large screens (default: 4)
    - `xl`: Number of columns for extra large screens
- `gap`: Optional spacing between items (2, 3, 4, 6, or 8)
- `className`: Optional additional CSS classes

**Example:**

```tsx
import { CardView } from '@/components/data-view';

<CardView
    items={wallets}
    columns={{ default: 1, md: 2, lg: 4 }}
    gap={4}
    renderItem={(wallet) => (
        <Card>
            <CardContent>
                <h3>{wallet.name}</h3>
                <p>{wallet.balance}</p>
            </CardContent>
        </Card>
    )}
/>;
```

### ListView

A vertical stacked list layout component.

**Props:**

- `items`: Array of data items (must have an `id` field)
- `renderItem`: Function that renders each item
- `spacing`: Optional vertical spacing between items (2, 3, 4, 6, or 8)
- `className`: Optional additional CSS classes

**Example:**

```tsx
import { ListView } from '@/components/data-view';

<ListView
    items={transactions}
    spacing={4}
    renderItem={(transaction) => (
        <Card>
            <CardContent>
                <h3>{transaction.description}</h3>
                <p>{transaction.amount}</p>
            </CardContent>
        </Card>
    )}
/>;
```

### ViewToggle

A toggle component for switching between list and card view modes.

**Props:**

- `view`: Current view mode ('list' | 'card')
- `onViewChange`: Function called when view mode changes
- `className`: Optional additional CSS classes

**Example:**

```tsx
import { ViewToggle, type ViewMode } from '@/components/data-view';
import { useState } from 'react';

function MyPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    return (
        <div>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            {/* Render content based on viewMode */}
        </div>
    );
}
```

## Complete Example

Here's a complete example using all components together:

```tsx
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CardView,
    ListView,
    ViewToggle,
    type ViewMode,
} from '@/components/data-view';
import AppLayout from '@/layouts/app-layout';

interface Item {
    id: number;
    name: string;
    description: string;
}

interface Props {
    items: Item[];
}

export default function Index({ items }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    return (
        <AppLayout>
            <Head title="Items" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Items</h1>
                    <div className="flex gap-2">
                        <ViewToggle
                            view={viewMode}
                            onViewChange={setViewMode}
                        />
                        <Button asChild>
                            <Link href="/items/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Item
                            </Link>
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <CardView
                        items={items}
                        columns={{ default: 1, md: 2, lg: 3 }}
                        renderItem={(item) => (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    />
                ) : (
                    <ListView
                        items={items}
                        renderItem={(item) => (
                            <Card>
                                <CardContent className="flex items-center justify-between p-6">
                                    <div>
                                        <h3 className="font-semibold">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    />
                )}
            </div>
        </AppLayout>
    );
}
```

## TypeScript Support

All components are fully typed with TypeScript generics, ensuring type safety when using them with your data:

```tsx
// Item type will be inferred from your items array
<CardView<MyItemType>
    items={myItems}
    renderItem={(item) => {
        // 'item' is automatically typed as MyItemType
        return <div>{item.name}</div>;
    }}
/>
```

## Responsive Design

Both CardView and ListView are designed to be responsive:

- **CardView**: Automatically adjusts columns based on screen size
- **ListView**: Maintains consistent spacing across all screen sizes

## Customization

### Custom Grid Columns

You can customize the number of columns for different screen sizes:

```tsx
<CardView
  items={items}
  columns={{
    default: 1,  // Mobile
    sm: 2,       // Small tablets
    md: 3,       // Tablets
    lg: 4,       // Desktops
    xl: 6,       // Large desktops
  }}
  renderItem={...}
/>
```

### Custom Spacing

Adjust spacing between items:

```tsx
<ListView items={items} spacing={6} renderItem={...} />
<CardView items={items} gap={8} renderItem={...} />
```

### Custom Styling

Add custom classes for additional styling:

```tsx
<CardView
  items={items}
  className="my-custom-class"
  renderItem={...}
/>
```

## Best Practices

1. **Use appropriate view modes**: Card view works well for visual data (products, images), while list view is better for text-heavy content (transactions, messages).

2. **Keep renderItem simple**: Extract complex item rendering logic into separate components.

3. **Type your data**: Always provide proper TypeScript types for your items.

4. **Consider mobile**: Test both view modes on mobile devices to ensure good UX.

5. **Consistent spacing**: Use the built-in spacing options (2, 3, 4, 6, 8) which align with Tailwind's spacing scale.

## Migration Guide

### Before (Old Pattern)

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    {items.map((item) => (
        <Card key={item.id}>
            <CardContent>{item.name}</CardContent>
        </Card>
    ))}
</div>
```

### After (New Pattern)

```tsx
<CardView
    items={items}
    columns={{ default: 1, md: 2, lg: 4 }}
    renderItem={(item) => (
        <Card>
            <CardContent>{item.name}</CardContent>
        </Card>
    )}
/>
```

## Pages Using These Components

The following pages have been refactored to use these components:

- `/resources/js/pages/Finance/Wallets/Index.tsx`
- `/resources/js/pages/Finance/Transactions/Index.tsx`
- `/resources/js/pages/Finance/Categories/Index.tsx`
- `/resources/js/pages/Finance/Subscriptions/Index.tsx`
- `/resources/js/pages/Finance/Installments/Index.tsx`

These pages serve as real-world examples of how to use the components.
