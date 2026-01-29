import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ListViewProps<T> {
    items: T[];
    renderItem: (item: T) => ReactNode;
    spacing?: number;
    className?: string;
}

export function ListView<T extends { id: number | string }>({
    items,
    renderItem,
    spacing = 4,
    className,
}: ListViewProps<T>) {
    const spacingClasses = {
        2: 'space-y-2',
        3: 'space-y-3',
        4: 'space-y-4',
        6: 'space-y-6',
        8: 'space-y-8',
    };

    return (
        <div
            className={cn(
                spacingClasses[spacing as keyof typeof spacingClasses],
                className,
            )}
        >
            {items.map((item) => (
                <div key={item.id}>{renderItem(item)}</div>
            ))}
        </div>
    );
}
