"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useQuoteRequestStore, QuoteStatus } from "@/stores/quoteRequestStore";
import { useQuoteRequestSync } from "@/hooks/useQuoteRequestSync";
import QuoteStatusBadge from "@/components/quotes/QuoteStatusBadge";
import { formatDistanceToNow } from "date-fns";

export default function SentQuotesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // Get sent quotes from store
  const sentQuotes = useQuoteRequestStore((state) =>
    Object.values(state.sentQuotes).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );

  // Enable server sync
  useQuoteRequestSync({
    syncWithServer: true,
    userId: session?.user?.id,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [loading, setLoading] = useState(false);

  // Authentication check
  if (authStatus === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (session?.user.role !== "customer") {
    router.push("/");
    return null;
  }

  // Apply filters
  const filteredQuotes = sentQuotes.filter((quote) => {
    // Search filter
    if (
      searchQuery &&
      !quote.workshopName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && quote.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Group quotes by status for quick stats
  const stats = sentQuotes.reduce(
    (acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0 } as Record<string, number>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" asChild>
            <Link href="/quotations">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quotations
            </Link>
          </Button>

          <Button asChild>
            <Link href="/quotations/request">
              <FileText className="w-4 h-4 mr-2" />
              New Quote Request
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Sent Quote Requests
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Track all your quote requests in one place
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.submitted || 0}
            </div>
            <div className="text-xs text-muted-foreground">Pending Response</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.quoted || 0}
            </div>
            <div className="text-xs text-muted-foreground">Quotes Received</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted || 0}
            </div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
              <Input
                placeholder="Search by workshop name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as QuoteStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Pending Response</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="quoted">Quote Received</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No Matching Quote Requests"
                : "No Quote Requests Yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for."
                : "Start by requesting quotes from workshops for your car repairs."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button asChild>
                <Link href="/quotations/request">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Quote Request
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card
              key={`${quote.carId}_${quote.workshopId}`}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Quote Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {quote.workshopName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quote ID: {quote.quotationId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(quote.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {quote.quotedAmount && (
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <span>Quote:</span>
                          <span>AED {quote.quotedAmount.toLocaleString()}</span>
                        </div>
                      )}

                      {quote.expiresAt && quote.status === "quoted" && (
                        <div className="flex items-center gap-1.5 text-orange-600">
                          <span>
                            Expires:{" "}
                            {formatDistanceToNow(new Date(quote.expiresAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <QuoteStatusBadge
                      status={quote.status}
                      quotedAmount={quote.quotedAmount}
                    />

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/quotations/${quote.quotationId}`}>
                          View Details
                          <ExternalLink className="w-3.5 h-3.5 ml-2" />
                        </Link>
                      </Button>

                      {quote.status === "quoted" && (
                        <Button size="sm" asChild>
                          <Link href={`/quotations/${quote.quotationId}`}>
                            Review Quote
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Showing Results Count */}
      {filteredQuotes.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filteredQuotes.length} of {sentQuotes.length} quote request
          {sentQuotes.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
