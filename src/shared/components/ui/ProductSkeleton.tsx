export default function ProductSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gray-300 dark:bg-gray-600 h-48 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-3/4"></div>
        <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-1/2"></div>
        <div className="bg-gray-300 dark:bg-gray-600 h-10 rounded w-full"></div>
      </div>
    </div>
  );
}