import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../shared/components/ui/dialog';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, slug: string) => void;
  isLoading?: boolean;
}

export default function AddCategoryDialog({ open, onOpenChange, onSubmit, isLoading }: Props) {
  const [name, setName] = useState('');

  const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), slug);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Add New Category</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Enter a category name. The slug will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Running Shoes"
              className="mt-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>
          {slug && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Slug: <span className="font-mono">{slug}</span></p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading || !name.trim()} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              {isLoading ? 'Adding...' : 'Add Category'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 dark:text-white dark:border-gray-600 dark:bg-gray-700">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}