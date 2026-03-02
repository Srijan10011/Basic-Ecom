import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface CategorySelectorProps {
  categories: Category[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  value,
  onValueChange,
  placeholder = "Select a category",
  className = "",
  showIcon = true
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              {showIcon && <Tag className="w-4 h-4" />}
              {category.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector;