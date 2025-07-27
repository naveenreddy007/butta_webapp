import { useMenuData } from '@/hooks/useMenuData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { formatPrice, getDietaryRestrictionLabel, getDietaryRestrictionColor } from '@/lib/menuValidation';

export function MenuDataTest() {
  const { 
    categories, 
    items, 
    loading, 
    error, 
    getItemsByCategory, 
    refreshData 
  } = useMenuData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading menu data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Menu
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshData} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Data Loaded Successfully ✅</CardTitle>
          <CardDescription>
            Found {categories.length} categories and {items.length} menu items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Menu Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const categoryItems = getItemsByCategory(category.id);
            return (
              <Card key={category.id} className="text-center">
                <CardHeader className="pb-3">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {categoryItems.length} items
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sample Items from Each Category */}
      {categories.map((category) => {
        const categoryItems = getItemsByCategory(category.id);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category.id}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              {category.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryItems.slice(0, 3).map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      
                      {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.dietaryRestrictions.map((restriction) => (
                            <Badge
                              key={restriction}
                              variant="secondary"
                              className={`text-xs ${getDietaryRestrictionColor(restriction)}`}
                            >
                              {getDietaryRestrictionLabel(restriction)}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {item.specialNotes && (
                        <p className="text-xs text-muted-foreground">
                          {item.specialNotes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {categoryItems.length > 3 && (
              <p className="text-sm text-muted-foreground mt-2">
                ... and {categoryItems.length - 3} more items
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}