import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout';
import { parseExcelFile, convertExcelDataToButtaMenu, ButtaMenuData } from '@/lib/excelParser';
import { MenuItem, MenuCategory } from '@/types';
import { ButtaMenuProvider, useButtaMenu, getCategoryCount, getCategoryLimit, isItemSelected } from '@/context/ButtaMenuContext';
import { ButtaCart } from './ButtaCart';
import { Plus, Minus, Check } from 'lucide-react';

interface ButtaFoodMenuProps {
  businessInfo: {
    name: string;
    branding: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
  onNavigateBack?: () => void;
}

export function ButtaFoodMenu({ businessInfo, onNavigateBack }: ButtaFoodMenuProps) {
  return (
    <ButtaMenuProvider>
      <ButtaFoodMenuContent businessInfo={businessInfo} onNavigateBack={onNavigateBack} />
      <ButtaCart businessInfo={businessInfo} />
    </ButtaMenuProvider>
  );
}

function ButtaFoodMenuContent({ businessInfo, onNavigateBack }: ButtaFoodMenuProps) {
  const { state } = useButtaMenu();
  const [menuData, setMenuData] = useState<ButtaMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadButtaMenuData();
  }, []);

  const loadButtaMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse both Excel files
      const vegData = await parseExcelFile('/MENU_ITEMS/Butta Convention Veg.  2025 May.xlsx');
      const nonVegData = await parseExcelFile('/MENU_ITEMS/Butta Convention Non Veg  2025 May.xlsx');

      // Convert to menu format
      const buttaMenu = convertExcelDataToButtaMenu(vegData, nonVegData);
      setMenuData(buttaMenu);
    } catch (err) {
      console.error('Error loading Butta menu data:', err);
      setError('Failed to load menu data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuData?.items.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const getCategoryItems = (categoryId: string) => {
    return menuData?.items.filter(item => item.category === categoryId) || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Container>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading Butta Food Menu...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Container>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-lg text-red-600 mb-4">{error}</p>
              <Button onClick={loadButtaMenuData}>Try Again</Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <Container>
          {onNavigateBack && (
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={onNavigateBack}
                className="text-white border-white hover:bg-white hover:text-orange-600"
              >
                ← Back to Home
              </Button>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Butta Food Menu
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Authentic flavors for your special events
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🌱 Vegetarian Options
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🍖 Non-Vegetarian Delights
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🎉 Event Catering
              </Badge>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Selection Limits Info */}
      <section className="py-6 bg-white border-b">
        <Container>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Category Selection Limits</h3>
            <p className="text-sm text-gray-600">Items beyond the limit will be added as add-ons</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {state.categoryLimits.map(limit => {
              const count = getCategoryCount(state, limit.categoryId);
              const isExceeded = count > limit.limit;
              return (
                <div key={limit.categoryId} className={`text-center p-3 rounded-lg border ${
                  isExceeded ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="font-medium text-sm">{limit.name}</div>
                  <div className={`text-lg font-bold ${isExceeded ? 'text-orange-600' : 'text-gray-700'}`}>
                    {count}/{limit.limit}
                  </div>
                  {isExceeded && (
                    <div className="text-xs text-orange-600">
                      +{count - limit.limit} add-on
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white shadow-sm">
        <Container>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="mb-2"
            >
              All Items ({menuData?.items.length || 0})
            </Button>
            {menuData?.categories.map((category) => {
              const itemCount = getCategoryItems(category.id).length;
              if (itemCount === 0) return null;
              
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="mb-2"
                >
                  {category.icon} {category.name} ({itemCount})
                </Button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Menu Items */}
      <section className="py-16">
        <Container>
          {selectedCategory === 'all' ? (
            // Show all categories
            <div className="space-y-16">
              {menuData?.categories.map((category) => {
                const categoryItems = getCategoryItems(category.id);
                if (categoryItems.length === 0) return null;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        {category.icon} {category.name}
                      </h2>
                      <p className="text-gray-600 text-lg">{category.description}</p>
                      <div className="mt-2">
                        <CategoryLimitBadge categoryId={category.id} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryItems.map((item, index) => (
                        <MenuItemCard key={item.id} item={item} index={index} />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // Show selected category
            <div>
              <div className="text-center mb-8">
                <CategoryLimitBadge categoryId={selectedCategory} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                  <MenuItemCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && selectedCategory !== 'all' && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No items found in this category.</p>
            </div>
          )}
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-xl mb-8">Contact us for custom menu planning and event catering</p>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <h3 className="font-semibold mb-2">📞 Phone</h3>
                <p>+91 88018 86108</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">📧 Email</h3>
                <p>info@arkevents.com</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">📍 Location</h3>
                <p>Banjara Hills, Hyderabad</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function CategoryLimitBadge({ categoryId }: { categoryId: string }) {
  const { state } = useButtaMenu();
  const count = getCategoryCount(state, categoryId);
  const limit = getCategoryLimit(state, categoryId);
  const categoryName = state.categoryLimits.find(cl => cl.categoryId === categoryId)?.name || '';

  if (count === 0) return null;

  return (
    <Badge 
      variant="outline" 
      className={`text-sm px-3 py-1 ${
        count > limit 
          ? 'border-orange-300 text-orange-700 bg-orange-50' 
          : 'border-green-300 text-green-700 bg-green-50'
      }`}
    >
      {categoryName}: {count}/{limit} selected
      {count > limit && ` (+${count - limit} add-on)`}
    </Badge>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

function MenuItemCard({ item, index }: MenuItemCardProps) {
  const { state, dispatch } = useButtaMenu();
  const selection = isItemSelected(state, item.id);
  const categoryCount = getCategoryCount(state, item.category);
  const categoryLimit = getCategoryLimit(state, item.category);
  const isOverLimit = categoryCount >= categoryLimit;
  const willBeAddOn = !selection && isOverLimit;

  const addItem = () => {
    dispatch({ type: 'ADD_ITEM', payload: { item } });
  };

  const updateQuantity = (quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: { itemId: item.id } });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId: item.id, quantity } });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className={`h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${
        selection ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500'
      }`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {item.name}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {item.description}
              </CardDescription>
            </div>
            {selection && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {item.dietaryRestrictions?.includes('vegetarian') && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🌱 Vegetarian
              </Badge>
            )}
            {!item.dietaryRestrictions?.includes('vegetarian') && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                🍖 Non-Veg
              </Badge>
            )}
            {willBeAddOn && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                Will be Add-On
              </Badge>
            )}
            {selection?.isAddOn && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                Add-On Item
              </Badge>
            )}
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Available
            </Badge>
          </div>

          {/* Category limit info */}
          <div className="text-xs text-gray-500 mb-3">
            Category: {categoryCount}/{categoryLimit} selected
            {isOverLimit && !selection && (
              <span className="text-orange-600 font-medium"> (Next will be add-on)</span>
            )}
          </div>

          {item.specialNotes && (
            <p className="text-sm text-gray-500 italic mb-4">
              {item.specialNotes}
            </p>
          )}

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            {selection ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(selection.quantity - 1)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{selection.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(selection.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={addItem}
                size="sm"
                className={`${
                  willBeAddOn 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Plus className="h-3 w-3 mr-1" />
                {willBeAddOn ? 'Add as Add-On' : 'Add to Menu'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}