import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";
import { useMenuSelection } from "@/context/MenuSelectionContext";
import { formatPrice } from "@/lib/menuValidation";
import { generateMenuPDF } from "@/lib/pdfGenerator";
import type { BusinessInfo } from "@/types";

interface PDFPreviewProps {
  businessInfo: BusinessInfo;
  onClose?: () => void;
}

export function PDFPreview({ businessInfo, onClose }: PDFPreviewProps) {
  const { state } = useMenuSelection();
  const { selectedItems, totalPrice } = state;

  const handleDownloadPDF = () => {
    generateMenuPDF({
      businessInfo,
      selections: selectedItems,
      customerInfo: {
        eventDate: new Date().toLocaleDateString(),
        eventType: 'Catering Event',
      }
    });
  };

  if (selectedItems.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            No Items Selected
          </CardTitle>
          <CardDescription>
            Add items to your cart to generate a PDF menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Browse our menu categories and select items to create your custom catering menu PDF.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                PDF Preview
              </CardTitle>
              <CardDescription>
                Preview of your catering menu PDF
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* PDF Header Preview */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {businessInfo.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Professional Catering Services
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>📞 {businessInfo.contact.phone}</div>
              <div>✉️ {businessInfo.contact.email}</div>
              <div>📍 {businessInfo.contact.address}</div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Event Details</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Event Date: {new Date().toLocaleDateString()}</div>
              <div>Event Type: Catering Event</div>
              <div>Items Selected: {selectedItems.length}</div>
            </div>
          </div>

          {/* Menu Items Preview */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Selected Menu Items</h3>
            <div className="space-y-3">
              {selectedItems.map((selection) => (
                <div
                  key={selection.item.id}
                  className="flex justify-between items-start p-3 bg-muted/20 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {selection.item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {selection.item.description}
                        </p>
                        {selection.item.dietaryRestrictions && 
                         selection.item.dietaryRestrictions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {selection.item.dietaryRestrictions.map((restriction) => (
                              <Badge key={restriction} variant="outline" className="text-xs">
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {selection.item.specialNotes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {selection.item.specialNotes}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-muted-foreground">
                          Qty: {selection.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(selection.item.price)} each
                        </div>
                        <div className="font-semibold text-foreground">
                          {formatPrice(selection.item.price * selection.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">
                Grand Total:
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          {/* Terms Preview */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">Terms & Conditions</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• All prices are subject to change based on final guest count</li>
              <li>• A 50% deposit is required to confirm your booking</li>
              <li>• Final guest count must be confirmed 48 hours before the event</li>
              <li>• We accommodate dietary restrictions with advance notice</li>
            </ul>
          </div>

          {/* Download Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF Menu
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            PDF will be generated with your business branding and contact information
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}