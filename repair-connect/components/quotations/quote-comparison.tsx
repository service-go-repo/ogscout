"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  Wrench,
  DollarSign,
  Shield,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import {
  WorkshopQuote,
  formatCurrency,
  isQuoteExpired,
  getQuoteStatusColor,
} from "@/models/Quotation";

// Extended quote interface with workshop location and rating data
interface EnrichedWorkshopQuote extends WorkshopQuote {
  location?: {
    address: string;
    city: string;
    state: string;
    coordinates: [number, number] | null;
  };
  rating?: {
    overall: number;
    totalReviews: number;
    serviceSpecific?: {
      averageRating: number;
      reviewCount: number;
      services: string[];
    };
  };
  distance?: number | null;
  workshopInfo?: {
    businessName: string;
    logo?: string;
    phone?: string;
    email?: string;
    certifications?: any[];
    specializations?: any;
  };
}

interface QuoteComparisonProps {
  quotes: EnrichedWorkshopQuote[];
  onAcceptQuote: (quoteId: string) => Promise<void>;
  onDeclineQuote: (quoteId: string) => Promise<void>;
  onContactWorkshop: (quote: EnrichedWorkshopQuote) => void;
  onBookAppointment?: (quote: EnrichedWorkshopQuote) => void;
  isLoading?: boolean;
  acceptedQuoteId?: string;
  hasExistingAppointment?: boolean;
  appointmentData?: any;
}

export default function QuoteComparison({
  quotes,
  onAcceptQuote,
  onDeclineQuote,
  onContactWorkshop,
  onBookAppointment,
  isLoading,
  acceptedQuoteId,
  hasExistingAppointment,
  appointmentData,
}: QuoteComparisonProps) {
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);

  const submittedQuotes = quotes.filter(
    (q) =>
      q.status === "submitted" ||
      q.status === "accepted" ||
      q.status === "declined",
  );

  // Separate active and declined quotes
  const activeQuotes = submittedQuotes.filter(q => q.status !== "declined");
  const declinedQuotes = submittedQuotes.filter(q => q.status === "declined");

  const sortedQuotes = [...activeQuotes].sort(
    (a, b) => a.totalAmount - b.totalAmount,
  );

  const sortedDeclinedQuotes = [...declinedQuotes].sort(
    (a, b) => a.totalAmount - b.totalAmount,
  );

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes((prev) =>
      prev.includes(quoteId)
        ? prev.filter((id) => id !== quoteId)
        : [...prev, quoteId],
    );
  };

  const toggleQuoteExpansion = (quoteId: string) => {
    setExpandedQuote((prev) => (prev === quoteId ? null : quoteId));
  };

  if (submittedQuotes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Quotes Yet
            </h3>
            <p className="text-muted-foreground">
              Workshops are reviewing your request. Quotes typically arrive
              within 24-48 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Quote Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {submittedQuotes.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Quotes Received
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(
                  Math.min(...submittedQuotes.map((q) => q.totalAmount)),
                )}
              </div>
              <div className="text-sm text-muted-foreground">Lowest Quote</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(
                  Math.max(...submittedQuotes.map((q) => q.totalAmount)),
                )}
              </div>
              <div className="text-sm text-muted-foreground">Highest Quote</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {formatCurrency(
                  submittedQuotes.reduce((sum, q) => sum + q.totalAmount, 0) /
                    submittedQuotes.length,
                )}
              </div>
              <div className="text-sm text-muted-foreground">Average Quote</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Quote Cards */}
      {sortedQuotes.length > 0 && (
        <div className="space-y-4">
          {sortedQuotes.map((quote, index) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              rank={index + 1}
              isLowest={index === 0}
              isExpanded={expandedQuote === quote.id}
              isSelected={selectedQuotes.includes(quote.id)}
              isAccepted={quote.status === "accepted"}
              isExpired={isQuoteExpired(quote)}
              onToggleSelection={() => toggleQuoteSelection(quote.id)}
              onToggleExpansion={() => toggleQuoteExpansion(quote.id)}
              onAccept={() => onAcceptQuote(quote.id)}
              onDecline={() => onDeclineQuote(quote.id)}
              onContact={() => onContactWorkshop(quote)}
              onBookAppointment={
                onBookAppointment ? () => onBookAppointment(quote) : undefined
              }
              isLoading={isLoading}
              disabled={!!acceptedQuoteId && acceptedQuoteId !== quote.id}
              hasExistingAppointment={hasExistingAppointment}
              appointmentData={appointmentData}
            />
          ))}
        </div>
      )}

      {/* Declined Quotes Accordion */}
      {sortedDeclinedQuotes.length > 0 && (
        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="declined-quotes" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-semibold text-base">Declined Quotes</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {sortedDeclinedQuotes.length} quote{sortedDeclinedQuotes.length !== 1 ? 's' : ''} declined
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-2">
                  {sortedDeclinedQuotes.map((quote, index) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      rank={index + 1}
                      isLowest={false}
                      isExpanded={expandedQuote === quote.id}
                      isSelected={selectedQuotes.includes(quote.id)}
                      isAccepted={false}
                      isExpired={isQuoteExpired(quote)}
                      onToggleSelection={() => toggleQuoteSelection(quote.id)}
                      onToggleExpansion={() => toggleQuoteExpansion(quote.id)}
                      onAccept={() => onAcceptQuote(quote.id)}
                      onDecline={() => onDeclineQuote(quote.id)}
                      onContact={() => onContactWorkshop(quote)}
                      onBookAppointment={
                        onBookAppointment ? () => onBookAppointment(quote) : undefined
                      }
                      isLoading={isLoading}
                      disabled={true}
                      hasExistingAppointment={hasExistingAppointment}
                      appointmentData={appointmentData}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedQuotes.length > 0 && !acceptedQuoteId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedQuotes.length} quote
                {selectedQuotes.length !== 1 ? "s" : ""} selected
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setSelectedQuotes([])}>
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    selectedQuotes.forEach((quoteId) =>
                      onDeclineQuote(quoteId),
                    );
                    setSelectedQuotes([]);
                  }}
                  disabled={isLoading}
                >
                  Decline Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface QuoteCardProps {
  quote: EnrichedWorkshopQuote;
  rank: number;
  isLowest: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isAccepted: boolean;
  isExpired: boolean;
  onToggleSelection: () => void;
  onToggleExpansion: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onContact: () => void;
  onBookAppointment?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  hasExistingAppointment?: boolean;
  appointmentData?: any;
}

function QuoteCard({
  quote,
  rank,
  isLowest,
  isExpanded,
  isSelected,
  isAccepted,
  isExpired,
  onToggleSelection,
  onToggleExpansion,
  onAccept,
  onDecline,
  onContact,
  onBookAppointment,
  isLoading,
  disabled,
  hasExistingAppointment,
  appointmentData,
}: QuoteCardProps) {
  const isDeclined = quote.status === "declined";

  return (
    <Card
      className={`
      transition-all duration-200
      ${isSelected ? "ring-2 ring-primary" : ""}
      ${isAccepted ? "ring-2 ring-emerald-500 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 shadow-lg" : ""}
      ${isDeclined ? "bg-muted/30 opacity-75" : ""}
      ${disabled && !isDeclined ? "opacity-60" : disabled && isDeclined ? "" : "hover:shadow-md"}
      ${isLowest && !isAccepted && !isDeclined ? "border-2 border-emerald-500 border-dashed" : ""}
    `}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={quote.workshopLogo} alt={quote.workshopName} />
              <AvatarFallback>
                {quote.workshopName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{quote.workshopName}</h3>
                {isAccepted && (
                  <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-0 shadow-md">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                )}
                {isLowest && !isAccepted && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Best Price
                  </Badge>
                )}
                {rank <= 3 && !isAccepted && (
                  <Badge variant="outline" className="text-xs">
                    #{rank}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                {quote.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{quote.location.city}</span>
                    {quote.distance && (
                      <span className="text-primary font-medium">
                        ({quote.distance}km)
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>
                    {quote.rating?.serviceSpecific?.averageRating ||
                      quote.rating?.overall ||
                      0}
                    {quote.rating?.serviceSpecific && (
                      <span className="text-xs text-gray-500 ml-1">
                        (service-specific)
                      </span>
                    )}
                  </span>
                  {(quote.rating?.serviceSpecific?.reviewCount ||
                    quote.rating?.totalReviews) && (
                    <span className="text-xs text-gray-500">
                      (
                      {quote.rating?.serviceSpecific?.reviewCount ||
                        quote.rating?.totalReviews}
                      )
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(quote.totalAmount)}
            </div>
            <Badge className={getQuoteStatusColor(quote.status)}>
              {quote.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{quote.estimatedDuration} days</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {quote.estimatedStartDate
                ? format(new Date(quote.estimatedStartDate), "MMM dd")
                : "TBD"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>{quote.warranty || "No warranty"}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{quote.paymentTerms || "Standard"}</span>
          </div>
        </div>

        {/* Expiry Warning */}
        {isExpired && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">
              This quote has expired on{" "}
              {format(new Date(quote.validUntil), "MMM dd, yyyy")}
            </span>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Services Breakdown */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Services Breakdown
              </h4>
              <div className="space-y-3">
                {quote.services.map((service, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{service.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.laborHours}h ×{" "}
                          {formatCurrency(service.laborRate)}/h
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(service.subtotal)}
                        </div>
                      </div>
                    </div>

                    {service.parts.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="text-sm font-medium text-foreground mb-1">
                          Parts:
                        </div>
                        {service.parts.map((part, partIndex) => (
                          <div
                            key={partIndex}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {part.name} × {part.quantity}
                            </span>
                            <span>{formatCurrency(part.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {service.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <strong>Notes:</strong> {service.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h4 className="font-medium mb-3">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Labor Cost:</span>
                  <span>{formatCurrency(quote.totalLaborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parts Cost:</span>
                  <span>{formatCurrency(quote.totalPartsCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                {quote.discount && quote.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount:</span>
                    <span>-{formatCurrency(quote.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(quote.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(quote.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {quote.notes && (
              <div>
                <h4 className="font-medium mb-2">Additional Notes</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {quote.notes}
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                {quote.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{quote.contactPhone}</span>
                  </div>
                )}
                {quote.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{quote.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Scheduled Info */}
            {isAccepted && hasExistingAppointment && appointmentData && (
              <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-lg p-4 border-2 border-emerald-200 dark:border-emerald-800">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Calendar className="h-4 w-4" />
                  Appointment Scheduled
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(appointmentData.scheduledDate), "EEEE, MMMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {appointmentData.scheduledStartTime} - {appointmentData.scheduledEndTime}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`
                        ${appointmentData.status === 'confirmed' ? 'bg-emerald-500 text-white' : ''}
                        ${appointmentData.status === 'scheduled' ? 'bg-blue-500 text-white' : ''}
                        ${appointmentData.status === 'requested' ? 'bg-amber-500 text-white' : ''}
                        ${appointmentData.status === 'in_progress' ? 'bg-violet-500 text-white' : ''}
                        ${appointmentData.status === 'completed' ? 'bg-emerald-600 text-white' : ''}
                      `}
                    >
                      {appointmentData.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <Separator className="bg-emerald-200 dark:bg-emerald-800" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointmentData.workshopName || quote.workshopName}</span>
                    </div>
                    {(appointmentData.workshopPhone || quote.contactPhone) && (
                      <div className="flex items-center gap-2 ml-6">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{appointmentData.workshopPhone || quote.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-4 border-t">
          {/* Primary actions */}
          <div className="flex flex-wrap gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleExpansion}
              className="flex-1 sm:flex-initial"
            >
              {isExpanded ? "Show Less" : "View Details"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onContact}
              className="flex items-center gap-2 flex-1 sm:flex-initial"
            >
              <MessageSquare className="h-3 w-3" />
              Contact
            </Button>
          </div>

          {/* Secondary actions - full width on mobile */}
          {!isAccepted && !isExpired && !disabled && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={onAccept}
                disabled={isLoading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1"
              >
                <CheckCircle className="h-3 w-3" />
                Accept Quote
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDecline}
                disabled={isLoading}
                className="flex items-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 flex-1"
              >
                <XCircle className="h-3 w-3" />
                Decline
              </Button>
            </div>
          )}

          {isAccepted && (
            <>
              {hasExistingAppointment ? (
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-md flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Appointment Booked
                </Badge>
              ) : (
                <>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Accepted
                  </Badge>
                  {onBookAppointment && (
                    <Button
                      size="sm"
                      onClick={onBookAppointment}
                      className="flex items-center gap-2 w-full sm:w-auto bg-sky-500 hover:bg-sky-600"
                    >
                      <Calendar className="h-3 w-3" />
                      Book Appointment
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
