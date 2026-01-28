import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/types/finance';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  type?: 'income' | 'expense' | 'all';
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  categories,
  type = 'all',
  label = 'Category',
  placeholder = 'Select a category',
  error,
  required = false,
}: CategorySelectProps) {
  const filteredCategories = type === 'all' 
    ? categories 
    : categories.filter((cat) => cat.type === type);

  return (
    <div className="space-y-2">
      <Label htmlFor="category_id">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredCategories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              <div className="flex items-center gap-2">
                {category.color && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span>{category.name}</span>
                {category.icon && <span className="text-xs">{category.icon}</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
