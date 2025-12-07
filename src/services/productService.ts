export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Minimal Chair',
    price: 129.99,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1000',
    description: 'A beautiful minimal chair designed for modern living spaces. Features ergonomic support and premium materials.',
  },
  {
    id: '2',
    name: 'Modern Lamp',
    price: 89.99,
    category: 'Lighting',
    image: 'https://images.unsplash.com/photo-1507473888900-52e1ad145924?auto=format&fit=crop&q=80&w=1000',
    description: 'Sleek lighting solution for your workspace. Adjustable brightness and color temperature.',
  },
  {
    id: '3',
    name: 'Ceramic Vase',
    price: 45.00,
    category: 'Decoration',
    image: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&q=80&w=1000',
    description: 'Handcrafted ceramic vase with a matte finish. Perfect for dry flowers or as a standalone piece.',
  },
  {
    id: '4',
    name: 'Abstract Art',
    price: 299.00,
    category: 'Art',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
    description: 'Original abstract artwork on canvas. Adds a touch of sophistication to any room.',
  },
  {
    id: '5',
    name: 'Smart Speaker',
    price: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=1000',
    description: 'High-fidelity smart speaker with voice control assistant integration.',
  },
    {
    id: '6',
    name: 'Lounge Sofa',
    price: 899.99,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000',
    description: 'Luxurious lounge sofa with deep seating and soft fabric upholstery.',
  }
];

export const getProducts = () => Promise.resolve(MOCK_PRODUCTS);

export const getProductById = (id: string) => {
  return Promise.resolve(MOCK_PRODUCTS.find(p => p.id === id));
};
