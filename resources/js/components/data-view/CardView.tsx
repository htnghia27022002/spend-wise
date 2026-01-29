import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardViewProps<T> {
    items: T[];
    renderItem: (item: T) => ReactNode;
    columns?: {
        default?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: number;
    className?: string;
}

export function CardView<T extends { id: number | string }>({
    items,
    renderItem,
    columns = { default: 1, md: 2, lg: 4 },
    gap = 4,
    className,
}: CardViewProps<T>) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
    };

    const gapClasses = {
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        6: 'gap-6',
        8: 'gap-8',
    };

    const gridClasses = [
        columns.default && gridCols[columns.default as keyof typeof gridCols],
        columns.sm && `sm:${gridCols[columns.sm as keyof typeof gridCols]}`,
        columns.md && `md:${gridCols[columns.md as keyof typeof gridCols]}`,
        columns.lg && `lg:${gridCols[columns.lg as keyof typeof gridCols]}`,
        columns.xl && `xl:${gridCols[columns.xl as keyof typeof gridCols]}`,
        gapClasses[gap as keyof typeof gapClasses],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={cn('grid', gridClasses, className)}>
            {items.map((item) => (
                <div key={item.id}>{renderItem(item)}</div>
            ))}
        </div>
    );
}
