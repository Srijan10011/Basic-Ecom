// Dummy data for products
const products = [
  { id: 1, name: 'Smartphone', price: 699, image: 'https://via.placeholder.com/300' },
  { id: 2, name: 'Laptop', price: 1299, image: 'https://via.placeholder.com/300' },
  { id: 3, name: 'Headphones', price: 199, image: 'https://via.placeholder.com/300' },
  { id: 4, name: 'Smartwatch', price: 299, image: 'https://via.placeholder.com/300' },
  { id: 5, name: 'Camera', price: 899, image: 'https://via.placeholder.com/300' },
  { id: 6, name: 'Tablet', price: 499, image: 'https://via.placeholder.com/300' },
];

const Shop = () => {
  return (
    <div className="container mx-auto py-20">
      <h1 className="text-4xl font-bold text-center mb-12">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-lg shadow-md">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded-md" />
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <p className="text-sm text-gray-600 mb-4">Rs {product.price}</p>
            <button className="bg-yellow-500 text-white py-2 px-4 rounded-full w-full hover:bg-yellow-600">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
