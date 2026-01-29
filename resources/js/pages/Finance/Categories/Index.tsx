import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { CardView, ListView, ViewToggle, type ViewMode } from '@/components/data-view';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Finance', href: '/finance/dashboard' },
  { title: 'Categories', href: '/categories' },
];

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  is_active: boolean;
}

interface Props {
  categories: Category[];
}

export default function Index({ categories }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage transaction categories</p>
          </div>
          <div className="flex gap-2">
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild>
              <Link href="/categories/create">
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Link>
            </Button>
          </div>
        </div>

        {viewMode === 'card' ? (
          <CardView
            items={categories}
            columns={{ default: 1, md: 2, lg: 3 }}
            renderItem={(cat) => (
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-4">
                    {cat.color && (
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{cat.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/categories/${cat.id}/edit`}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        if (confirm('Delete category?')) {
                          router.delete(`/categories/${cat.id}`);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        ) : (
          <ListView
            items={categories}
            renderItem={(cat) => (
              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    {cat.color && (
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{cat.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/categories/${cat.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete category?')) {
                          router.delete(`/categories/${cat.id}`);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
