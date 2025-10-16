'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MapPin,
  Clock,
  CheckCircle,
  Award,
  Users
} from 'lucide-react'
import { Workshop, getServiceTypeLabel, getCarBrandLabel, getDistanceLabel } from '@/models/Workshop'
import RatingDisplay from '@/components/common/rating-display'

interface WorkshopCardProps {
  workshop: Workshop
  distance?: number
  isOpen?: boolean
  viewMode?: 'grid' | 'list'
}

export default function WorkshopCard({
  workshop,
  distance,
  isOpen,
  viewMode = 'grid'
}: WorkshopCardProps) {

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Logo */}
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
              <AvatarImage src={workshop.profile?.logo} alt={workshop.profile?.businessName || 'Workshop'} />
              <AvatarFallback className="text-lg font-bold">
                {(workshop.profile?.businessName || 'W').charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Main Content */}
            <div className="flex-1 min-w-0 w-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl font-semibold">
                      {workshop.profile?.businessName || 'Unknown Workshop'}
                    </h3>
                    {workshop.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <RatingDisplay
                      rating={workshop.stats?.averageRating || 0}
                      totalReviews={workshop.stats?.totalReviews || 0}
                      size="sm"
                    />
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {workshop.contact?.address?.emirate || workshop.contact?.address?.state || workshop.contact?.address?.city || 'Location not specified'}
                        {(workshop.contact?.address?.emirate || workshop.contact?.address?.state || workshop.contact?.address?.city) && workshop.contact?.address?.zipCode && `, ${workshop.contact.address.zipCode}`}
                        {distance && (
                          <span className="ml-2">• {getDistanceLabel(distance)} away</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOpen !== undefined && (
                    <Badge variant={isOpen ? 'default' : 'secondary'} className="text-xs whitespace-nowrap">
                      <Clock className="w-3 h-3 mr-1" />
                      {isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {workshop.profile?.description || 'No description available'}
              </p>

              {/* Services */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(workshop.profile?.specializations?.serviceTypes || []).slice(0, 4).map((service) => (
                  <Badge key={service} variant="outline" className="text-xs border-primary text-primary">
                    {getServiceTypeLabel(service)}
                  </Badge>
                ))}
                {(workshop.profile?.specializations?.serviceTypes?.length || 0) > 4 && (
                  <Badge variant="outline" className="text-xs border-primary text-primary">
                    +{(workshop.profile?.specializations?.serviceTypes?.length || 0) - 4} more
                  </Badge>
                )}
              </div>

              {/* Car Brands */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(workshop.profile?.specializations?.carBrands || []).slice(0, 6).map((brand) => (
                  <Badge key={brand} variant="secondary" className="text-xs">
                    {getCarBrandLabel(brand)}
                  </Badge>
                ))}
                {(workshop.profile?.specializations?.carBrands?.length || 0) > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{(workshop.profile?.specializations?.carBrands?.length || 0) - 6} more
                  </Badge>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground mb-4">
                {workshop.profile?.yearEstablished && (
                  <span className="whitespace-nowrap">Est. {workshop.profile.yearEstablished}</span>
                )}
                {workshop.profile?.employeeCount && (
                  <span className="flex items-center whitespace-nowrap">
                    <Users className="w-3 h-3 mr-1" />
                    {workshop.profile.employeeCount} employees
                  </span>
                )}
                <span className="flex items-center whitespace-nowrap">
                  <Award className="w-3 h-3 mr-1" />
                  {workshop.profile?.certifications?.length || 0} certifications
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-auto">
                <Button
                  size="lg"
                  className="w-full rounded-full h-12 font-semibold text-base shadow-md hover:shadow-lg transition-shadow"
                  asChild
                >
                  <Link href={`/workshops/${workshop._id}`}>
                    View Workshop Profile
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Avatar className="w-12 h-12">
            <AvatarImage src={workshop.profile.logo} alt={workshop.profile.businessName} />
            <AvatarFallback className="font-bold">
              {workshop.profile.businessName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-end gap-1">
            {workshop.isVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {isOpen !== undefined && (
              <Badge variant={isOpen ? 'default' : 'secondary'} className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {isOpen ? 'Open' : 'Closed'}
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold line-clamp-1">
            {workshop.profile.businessName}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <RatingDisplay
              rating={workshop.stats.averageRating}
              totalReviews={workshop.stats.totalReviews}
              size="sm"
            />
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {workshop.contact?.address?.emirate || workshop.contact?.address?.state || workshop.contact?.address?.city || 'Location not specified'}
            {(workshop.contact?.address?.emirate || workshop.contact?.address?.state || workshop.contact?.address?.city) && workshop.contact?.address?.zipCode && `, ${workshop.contact.address.zipCode}`}
            {distance && (
              <span className="ml-2">• {getDistanceLabel(distance)}</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {workshop.profile.description}
        </p>
        
        {/* Services */}
        <div className="flex flex-wrap gap-1 mb-3">
          {workshop.profile.specializations.serviceTypes.slice(0, 3).map((service) => (
            <Badge key={service} variant="outline" className="text-xs border-primary text-primary">
              {getServiceTypeLabel(service)}
            </Badge>
          ))}
          {workshop.profile.specializations.serviceTypes.length > 3 && (
            <Badge variant="outline" className="text-xs border-primary text-primary">
              +{workshop.profile.specializations.serviceTypes.length - 3}
            </Badge>
          )}
        </div>
        
        {/* Car Brands */}
        <div className="flex flex-wrap gap-1 mb-4">
          {workshop.profile.specializations.carBrands.slice(0, 4).map((brand) => (
            <Badge key={brand} variant="secondary" className="text-xs">
              {getCarBrandLabel(brand)}
            </Badge>
          ))}
          {workshop.profile.specializations.carBrands.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{workshop.profile.specializations.carBrands.length - 4}
            </Badge>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            {workshop.profile.yearEstablished && (
              <span>Est. {workshop.profile.yearEstablished}</span>
            )}
            <span className="flex items-center">
              <Award className="w-3 h-3 mr-1" />
              {workshop.profile.certifications?.length || 0}
            </span>
          </div>
          {workshop.profile.employeeCount && (
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {workshop.profile.employeeCount}
            </span>
          )}
        </div>
        
        {/* Actions */}
        <Button size="sm" className="w-full" asChild>
          <Link href={`/workshops/${workshop._id}`}>
            View Workshop Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
