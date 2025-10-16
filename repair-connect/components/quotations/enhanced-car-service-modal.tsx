'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useQuoteRequestStore } from '@/stores/quoteRequestStore'
import { CarSelectionView } from './car-selection-view'
import { ServiceSelectionView } from './service-selection-view'
import { WorkshopSelectionView } from './workshop-selection-view'
import { CarRegistrationModalView } from './car-registration-modal-view'
import { ServiceRequestModalView } from './service-request-modal-view'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

/**
 * Enhanced Car & Service Selection Modal
 *
 * Multi-step modal for quote request flow:
 * 1. Select Car (or register a new one)
 * 2. Select Service (or create a new service request)
 * 3. Select Workshops and send quote requests
 *
 * @example
 * <EnhancedCarServiceModal />
 *
 * // Open modal programmatically:
 * const openCarSelection = useQuoteRequestStore(state => state.openCarSelection);
 * openCarSelection();
 */
export function EnhancedCarServiceModal() {
  const modalView = useQuoteRequestStore((state) => state.modalView)
  const closeModal = useQuoteRequestStore((state) => state.closeModal)

  const isOpen = modalView !== 'closed'

  /**
   * Handle modal close
   * Resets modal view to 'closed'
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal()
    }
  }

  // Get title based on current view for accessibility
  const getAccessibleTitle = () => {
    if (modalView === 'cars') return 'Select Your Car'
    if (modalView === 'services') return 'Select a Service'
    if (modalView === 'workshops') return 'Select Workshops'
    if (modalView === 'car-registration') return 'Register Your Car'
    if (modalView === 'service-request') return 'Create Service Request'
    return 'Quote Request'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Visually hidden title for accessibility - required by Radix UI */}
        <VisuallyHidden>
          <DialogTitle>{getAccessibleTitle()}</DialogTitle>
        </VisuallyHidden>

        {/* Step 1: Car Selection */}
        {modalView === 'cars' && <CarSelectionView />}

        {/* Step 2: Service Selection */}
        {modalView === 'services' && <ServiceSelectionView />}

        {/* Step 3: Workshop Selection */}
        {modalView === 'workshops' && <WorkshopSelectionView />}

        {/* Alternative Step 1: Car Registration */}
        {modalView === 'car-registration' && <CarRegistrationModalView />}

        {/* Alternative Step 2: Service Request Creation */}
        {modalView === 'service-request' && <ServiceRequestModalView />}
      </DialogContent>
    </Dialog>
  )
}
