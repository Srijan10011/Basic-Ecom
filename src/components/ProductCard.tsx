import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Edit, Eye, Star } from 'lucide-react';

interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onView: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onView }) => {
  const productImage = product.image || '/placeholder-product.jpg';
  const productDescription = product.description || product.shortDescription || 'No description available';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-700">
      <div className="relative">
        <img 
          src={productImage} 
          alt={product.name} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.jpg';
          }}
        />
        {product.badge && (
          <Badge 
            className="absolute top-2 right-2 text-white"
            style={{ backgroundColor: product.badgeColor || '#3B82F6' }}
          >
            {product.badge}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
              {productDescription}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              Rs {parseFloat(product.price || 0).toFixed(2)}
            </span>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>{product.rating || 0}</span>
              <span>({product.reviews || 0})</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Stock: {product.stockQuantity || 0}</span>
            <span>ID: {product.id}</span>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 dark:text-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 dark:text-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => onView(product)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;