"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Award,
  Calendar,
  Star,
  MessageSquare,
  Camera,
  ExternalLink,
  CheckCircle,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
} from "lucide-react";
import {
  Workshop,
  ServiceType,
  getCertificationTypeLabel,
  getServiceTypeLabel,
  getCarBrandLabel,
} from "@/models/Workshop";
import RatingDisplay from "@/components/common/rating-display";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WorkshopProfileProps {
  workshop: Workshop;
  activeTab: "overview" | "portfolio" | "reviews";
}

interface AppointmentReview {
  _id: string;
  customerName: string;
  customerRating: number;
  customerReview: string;
  updatedAt: string;
  services: Array<{ serviceType: ServiceType }>;
}

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  folder: string;
  tags: string[];
}

export default function WorkshopProfile({
  workshop,
  activeTab,
}: WorkshopProfileProps) {
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<
    string | null
  >(null);
  const [reviews, setReviews] = useState<AppointmentReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: workshop.stats?.averageRating || 0,
    totalReviews: workshop.stats?.totalReviews || 0,
  });
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<number | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<number | null>(null);
  const [selectedPortfolioImageIndex, setSelectedPortfolioImageIndex] = useState<number>(0);
  const [portfolioImageType, setPortfolioImageType] = useState<'before' | 'after'>('after');
  const [cloudinaryGallery, setCloudinaryGallery] = useState<CloudinaryImage[]>([]);
  const [cloudinaryCertificates, setCloudinaryCertificates] = useState<CloudinaryImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Fetch images from Cloudinary when overview tab is active
  useEffect(() => {
    if (activeTab === "overview" && workshop._id) {
      fetchCloudinaryImages();
    }
  }, [activeTab, workshop._id]);

  // Fetch reviews from appointments when reviews tab is active
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, workshop.userId]);

  const fetchCloudinaryImages = async () => {
    try {
      setLoadingImages(true);
      // Use userId for querying Cloudinary as images are tagged with userId
      const userId = workshop.userId?.toString();
      const workshopId = workshop._id?.toString();

      if (!userId) {
        console.log('No workshop userId available');
        return;
      }

      // Use userId to query Cloudinary images
      const response = await fetch(`/api/workshops/${userId}/images?type=all`);
      const data = await response.json();

      if (data.success) {
        const galleryImages = data.data.images.filter((img: CloudinaryImage) =>
          img.folder.includes('gallery')
        );
        const certificateImages = data.data.images.filter((img: CloudinaryImage) =>
          img.folder.includes('certificates')
        );

        setCloudinaryGallery(galleryImages);
        setCloudinaryCertificates(certificateImages);
        console.log(`Loaded ${galleryImages.length} gallery images and ${certificateImages.length} certificates from Cloudinary for userId: ${userId}`);
      }
    } catch (error) {
      console.error('Error loading Cloudinary images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const userId = workshop.userId?.toString();

      // Fetch completed appointments with reviews for this workshop
      const response = await fetch(
        `/api/appointments?workshopId=${userId}&status=completed&limit=1000`,
      );
      const data = await response.json();

      if (data.success) {
        const appointmentsWithReviews = (
          data.data.appointments as any[]
        ).filter((apt) => apt.customerRating && apt.customerReview);
        setReviews(appointmentsWithReviews);

        // Calculate actual stats from appointments
        if (appointmentsWithReviews.length > 0) {
          const avgRating =
            appointmentsWithReviews.reduce(
              (sum, apt) => sum + apt.customerRating,
              0,
            ) / appointmentsWithReviews.length;
          setReviewStats({
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: appointmentsWithReviews.length,
          });
        } else {
          setReviewStats({ averageRating: 0, totalReviews: 0 });
        }
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About {workshop.profile.businessName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 leading-relaxed">
            {workshop.profile.description}
          </p>
        </CardContent>
      </Card>

      {/* Certifications */}
      {workshop.profile.certifications?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Certifications ({workshop.profile.certifications.length} {workshop.profile.certifications.length === 1 ? 'certificate' : 'certificates'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                <div className="flex gap-4 w-max min-w-full">
                  {workshop.profile.certifications?.map((cert, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors w-[320px] sm:w-[360px] flex-shrink-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-base mb-1">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getCertificationTypeLabel(cert.type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Issued by {cert.issuedBy}
                          </p>
                          {cert.certificateNumber && (
                            <p className="text-xs text-muted-foreground/80 mt-1">
                              Certificate #: {cert.certificateNumber}
                            </p>
                          )}
                        </div>
                        {cert.verified && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 flex-shrink-0"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground/80 gap-4 mb-3">
                        <span>
                          Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                        </span>
                        {cert.expiryDate && (
                          <span>
                            Expires:{" "}
                            {new Date(cert.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedCertificate(index)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        View Certificate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {(() => {
        // Combine database gallery and Cloudinary gallery
        // Database gallery items can be strings (URLs) or objects with url property
        const dbGalleryUrls = (workshop.profile.gallery || []).map(item =>
          typeof item === 'string' ? item : (item as {url: string}).url
        );
        const allGalleryImages = [
          ...dbGalleryUrls,
          ...cloudinaryGallery.map(img => img.secure_url)
        ];

        if (allGalleryImages.length === 0 && !loadingImages) {
          return null;
        }

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Workshop Gallery ({allGalleryImages.length} {allGalleryImages.length === 1 ? 'photo' : 'photos'})
                {loadingImages && <Loader2 className="w-4 h-4 ml-2 animate-spin text-primary" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allGalleryImages.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading gallery images...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {allGalleryImages.map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-muted/50 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setSelectedGalleryImage(index)}
                    >
                      <img
                        src={image}
                        alt={`${workshop.profile.businessName} - Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Failed to load image:', image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      {workshop.profile.portfolio?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Portfolio Items
            </h3>
            <p className="text-muted-foreground">
              This workshop hasn't added any portfolio items yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshop.profile.portfolio?.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted/50 relative">
                {item.afterImages?.length > 0 && (
                  <img
                    src={item.afterImages?.[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <Badge variant="outline">
                    {getServiceTypeLabel(item.serviceType)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                  {item.carBrand && (
                    <span>{getCarBrandLabel(item.carBrand)}</span>
                  )}
                  <span>
                    {new Date(item.completedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-muted-foreground/80">
                    {item.beforeImages?.length || 0} before,{" "}
                    {item.afterImages?.length || 0} after
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPortfolioItem(item.id)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviews = () => {
    if (loadingReviews) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Reviews Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 mb-4">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold">
                  {reviewStats.averageRating.toFixed(1)}
                </h3>
                <RatingDisplay
                  rating={reviewStats.averageRating}
                  totalReviews={reviewStats.totalReviews}
                  size="lg"
                />
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm text-muted-foreground">Based on</p>
                <p className="text-2xl font-bold">{reviewStats.totalReviews}</p>
                <p className="text-sm text-muted-foreground">reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(
                  (r) => Math.floor(r.customerRating) === rating,
                ).length;
                const percentage =
                  reviewStats.totalReviews > 0
                    ? (count / reviewStats.totalReviews) * 100
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Individual Reviews */}
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Reviews Yet
              </h3>
              <p className="text-muted-foreground">
                Be the first to leave a review for this workshop!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {review.customerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.customerName}</p>
                        <div className="flex items-center gap-2">
                          <RatingDisplay
                            rating={review.customerRating}
                            showText={false}
                            size="sm"
                          />
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.services && review.services.length > 0 && (
                        <Badge variant="outline">
                          {getServiceTypeLabel(review.services[0].serviceType)}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <p className="text-foreground/90 mb-3">
                    {review.customerReview}
                  </p>

                  {review.services && review.services.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {review.services.slice(1).map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground/80">
                    <span>
                      Completed:{" "}
                      {new Date(review.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "portfolio" && renderPortfolio()}
        {activeTab === "reviews" && renderReviews()}
      </div>

      {/* Gallery Lightbox */}
      {(() => {
        // Same URL extraction logic as gallery display
        const dbGalleryUrls = (workshop.profile.gallery || []).map(item =>
          typeof item === 'string' ? item : (item as {url: string}).url
        );
        const allGalleryImages = [
          ...dbGalleryUrls,
          ...cloudinaryGallery.map(img => img.secure_url)
        ];

        return (
          <Dialog open={selectedGalleryImage !== null} onOpenChange={() => setSelectedGalleryImage(null)}>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
              <DialogHeader className="sr-only">
                <DialogTitle>
                  Workshop Gallery - Image {selectedGalleryImage !== null ? selectedGalleryImage + 1 : 1} of {allGalleryImages.length}
                </DialogTitle>
                <DialogDescription>
                  View workshop gallery images in full screen. Use arrow keys or buttons to navigate between images.
                </DialogDescription>
              </DialogHeader>
              {selectedGalleryImage !== null && allGalleryImages.length > 0 && (
                <div className="relative bg-black">
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedGalleryImage(null)}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    aria-label="Close gallery"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute top-4 left-4 z-50 px-3 py-1.5 bg-black/50 text-white text-sm rounded-full">
                    {selectedGalleryImage + 1} / {allGalleryImages.length}
                  </div>

                  {/* Previous Button */}
                  {selectedGalleryImage > 0 && (
                    <button
                      onClick={() => setSelectedGalleryImage(selectedGalleryImage - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  {/* Next Button */}
                  {selectedGalleryImage < allGalleryImages.length - 1 && (
                    <button
                      onClick={() => setSelectedGalleryImage(selectedGalleryImage + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}

                  {/* Image */}
                  <div className="flex items-center justify-center min-h-[60vh] max-h-[85vh]">
                    <img
                      src={allGalleryImages[selectedGalleryImage]}
                      alt={`${workshop.profile.businessName} - Image ${selectedGalleryImage + 1}`}
                      className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Certificate Viewer */}
      <Dialog open={selectedCertificate !== null} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Certificate Details
            </DialogTitle>
            <DialogDescription>
              View complete certificate information including issuer, dates, and certificate document image.
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate !== null && workshop.profile.certifications && (
            <div className="space-y-4">
              {(() => {
                const cert = workshop.profile.certifications[selectedCertificate];
                return (
                  <>
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-lg">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getCertificationTypeLabel(cert.type)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground/80">Issued By</p>
                          <p className="font-medium">{cert.issuedBy}</p>
                        </div>

                        {cert.certificateNumber && (
                          <div>
                            <p className="text-muted-foreground/80">Certificate Number</p>
                            <p className="font-medium">{cert.certificateNumber}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-muted-foreground/80">Issue Date</p>
                          <p className="font-medium">
                            {new Date(cert.issuedDate).toLocaleDateString()}
                          </p>
                        </div>

                        {cert.expiryDate && (
                          <div>
                            <p className="text-muted-foreground/80">Expiry Date</p>
                            <p className="font-medium">
                              {new Date(cert.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {cert.verified && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Certificate
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            This certificate has been verified by {workshop.profile.businessName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Certificate Image - Not yet implemented */}
                    <div className="text-center text-sm text-muted-foreground p-4 bg-muted/20 rounded-lg">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                      <p>Certificate document not yet uploaded</p>
                      <p className="text-xs mt-1">The workshop can upload certificate images for verification</p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Portfolio Details Modal */}
      {(() => {
        const portfolioItem = workshop.profile.portfolio?.find(item => item.id === selectedPortfolioItem);
        if (!portfolioItem) return null;

        const allImages = portfolioImageType === 'before'
          ? portfolioItem.beforeImages || []
          : portfolioItem.afterImages || [];

        return (
          <Dialog open={selectedPortfolioItem !== null} onOpenChange={() => setSelectedPortfolioItem(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2 flex items-center gap-2">
                      {portfolioItem.title}
                      {portfolioItem.featured && (
                        <Badge className="bg-yellow-500 text-yellow-950">
                          Featured
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      View complete portfolio project details including before and after images
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Portfolio Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground/80">Service Type</p>
                    <p className="font-medium">{getServiceTypeLabel(portfolioItem.serviceType)}</p>
                  </div>
                  {portfolioItem.carBrand && (
                    <div>
                      <p className="text-sm text-muted-foreground/80">Vehicle Brand</p>
                      <p className="font-medium">{getCarBrandLabel(portfolioItem.carBrand)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground/80">Completed Date</p>
                    <p className="font-medium">{new Date(portfolioItem.completedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground/80">Images</p>
                    <p className="font-medium">
                      {portfolioItem.beforeImages?.length || 0} Before, {portfolioItem.afterImages?.length || 0} After
                    </p>
                  </div>
                </div>

                {/* Description */}
                {portfolioItem.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Project Description</h4>
                    <p className="text-foreground/90 leading-relaxed">
                      {portfolioItem.description}
                    </p>
                  </div>
                )}

                {/* Image Type Toggle */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setPortfolioImageType('before')}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      portfolioImageType === 'before'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Before ({portfolioItem.beforeImages?.length || 0})
                  </button>
                  <button
                    onClick={() => setPortfolioImageType('after')}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      portfolioImageType === 'after'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    After ({portfolioItem.afterImages?.length || 0})
                  </button>
                </div>

                {/* Image Gallery with Navigation */}
                {allImages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image Display */}
                    <div className="relative bg-muted/20 rounded-lg overflow-hidden">
                      <img
                        src={allImages[selectedPortfolioImageIndex]}
                        alt={`${portfolioItem.title} - ${portfolioImageType} ${selectedPortfolioImageIndex + 1}`}
                        className="w-full h-auto object-contain max-h-[500px]"
                      />

                      {/* Image Counter */}
                      {allImages.length > 1 && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full">
                          {selectedPortfolioImageIndex + 1} / {allImages.length}
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      {allImages.length > 1 && (
                        <>
                          {selectedPortfolioImageIndex > 0 && (
                            <button
                              onClick={() => setSelectedPortfolioImageIndex(selectedPortfolioImageIndex - 1)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                          )}
                          {selectedPortfolioImageIndex < allImages.length - 1 && (
                            <button
                              onClick={() => setSelectedPortfolioImageIndex(selectedPortfolioImageIndex + 1)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Thumbnail Navigation */}
                    {allImages.length > 1 && (
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-2 min-w-max">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedPortfolioImageIndex(idx)}
                              className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                                idx === selectedPortfolioImageIndex
                                  ? 'ring-2 ring-primary scale-105'
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground/40" />
                    <p>No {portfolioImageType} images available</p>
                  </div>
                )}

                {/* Close Button */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedPortfolioItem(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}
