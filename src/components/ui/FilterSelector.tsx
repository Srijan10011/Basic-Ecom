import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectorProps {
  options: FilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  className = "",
  icon
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FilterSelector;