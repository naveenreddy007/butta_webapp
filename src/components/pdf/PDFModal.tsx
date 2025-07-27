import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Download, User, Calendar, FileText } from "lucide-react";
import { PDFPreview } from "./PDFPreview";
import { generateMenuPDF } from "@/lib/pdfGenerator";
import { useMenuSelection } from "@/context/MenuSelectionContext";
import type { BusinessInfo } from "@/types";

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessInfo: BusinessInfo;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  guestCount: string;
}

export function PDFModal({ isOpen, onClose, businessInfo }: PDFModalProps) {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: '',
    guestCount: '',
  });
  
  const { state } = useMenuSelection();

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    setStep('preview');
  };

  const handleDownload = () => {
    generateMenuPDF({
      businessInfo,
      selections: state.selectedItems,
      customerInfo: {
        name: customerInfo.name || undefined,
        email: customerInfo.email || undefined,
        phone: customerInfo.phone || undefined,
        eventDate: customerInfo.eventDate || undefined,
        eventType: customerInfo.eventType || undefined,
        guestCount: customerInfo.guestCount ? parseInt(customerInfo.guestCount) : undefined,
      }
    });
    onClose();
  };

  const handleSkipAndDownload = () => {
    generateMenuPDF({
      businessInfo,
      selections: state.selectedItems,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden"
        >
          <Card className="h-full">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {step === 'form' ? 'Generate Menu PDF' : 'PDF Preview'}
                  </CardTitle>
                  <CardDescription>
                    {step === 'form' 
                      ? 'Add your event details (optional) to customize the PDF'
                      : 'Review your menu before downloading'
                    }
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {step === 'form' ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Customer Information Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact Information
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={customerInfo.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={customerInfo.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+91 98765 43210"
                          value={customerInfo.phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Event Details
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="eventDate">Event Date</Label>
                        <Input
                          id="eventDate"
                          type="date"
                          value={customerInfo.eventDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('eventDate', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventType">Event Type</Label>
                        <Input
                          id="eventType"
                          placeholder="e.g., Wedding, Corporate Event, Birthday Party"
                          value={customerInfo.eventType}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('eventType', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guestCount">Expected Guest Count</Label>
                        <Input
                          id="guestCount"
                          type="number"
                          placeholder="Number of guests"
                          value={customerInfo.guestCount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('guestCount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Order Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Items Selected</div>
                        <div className="font-semibold">{state.selectedItems.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Quantity</div>
                        <div className="font-semibold">{state.totalItems}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Estimated Total</div>
                        <div className="font-semibold text-primary">₹{state.totalPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">PDF Format</div>
                        <div className="font-semibold">Professional</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handlePreview}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                    >
                      Preview PDF
                    </Button>
                    <Button
                      onClick={handleSkipAndDownload}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Skip & Download
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    All fields are optional. You can generate the PDF with just your menu selections.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <PDFPreview businessInfo={businessInfo} />
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep('form')}
                      variant="outline"
                      className="flex-1"
                    >
                      ← Back to Edit
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}