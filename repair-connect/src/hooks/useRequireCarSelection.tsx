import { useState, useCallback, useEffect } from 'react';
import { useQuoteRequestStore } from '@/stores/quoteRequestStore';
import { Car } from '@/models/Car';
import { toast } from 'sonner';

/**
 * Hook to ensure a car is selected before executing an action.
 * If no car is selected, opens an inline car selection modal,
 * then executes the callback with the selected car.
 *
 * @example
 * const { requireCar, CarSelectionModal } = useRequireCarSelection();
 *
 * const handleRequestQuote = async () => {
 *   await requireCar(async (car) => {
 *     // This runs only if a car is selected
 *     await sendQuoteRequest(workshop.id, car._id);
 *   });
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleRequestQuote}>Request Quote</Button>
 *     <CarSelectionModal />
 *   </>
 * );
 */
export function useRequireCarSelection() {
  const selectedCar = useQuoteRequestStore((state) => state.selectedCar);
  const setSelectedCar = useQuoteRequestStore((state) => state.setSelectedCar);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<
    ((car: Car) => void | Promise<void>) | null
  >(null);

  // Fetch user's cars when modal opens
  useEffect(() => {
    if (isModalOpen && userCars.length === 0 && !isLoadingCars) {
      fetchUserCars();
    }
  }, [isModalOpen]);

  const fetchUserCars = async () => {
    setIsLoadingCars(true);
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setUserCars(data.data);

        if (data.data.length === 0) {
          toast.info('You need to register a car first', {
            action: {
              label: 'Register Car',
              onClick: () => {
                window.location.href = '/cars/register';
              },
            },
          });
        }
      } else {
        toast.error('Failed to load your cars');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load your cars');
    } finally {
      setIsLoadingCars(false);
    }
  };

  /**
   * Ensures a car is selected, then executes the callback
   * If no car is selected, opens modal; callback executes after selection
   */
  const requireCar = useCallback(
    async (callback: (car: Car) => void | Promise<void>) => {
      if (selectedCar) {
        // Car already selected, execute callback immediately
        await Promise.resolve(callback(selectedCar));
      } else {
        // No car selected, open modal and store callback
        setPendingCallback(() => callback);
        setIsModalOpen(true);
      }
    },
    [selectedCar]
  );

  /**
   * Handle car selection from modal
   */
  const handleCarSelect = useCallback(
    async (car: Car) => {
      setSelectedCar(car);
      setIsModalOpen(false);

      // Execute pending callback if exists
      if (pendingCallback) {
        await Promise.resolve(pendingCallback(car));
        setPendingCallback(null);
      }
    },
    [pendingCallback, setSelectedCar]
  );

  /**
   * Handle modal close without selection
   */
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setPendingCallback(null);
  }, []);

  return {
    requireCar,
    selectedCar,
    isModalOpen,
    setIsModalOpen,
    userCars,
    isLoadingCars,
    handleCarSelect,
    handleModalClose,
  };
}

/**
 * React Context alternative implementation (for reference)
 *
 * Create this in a separate file: src/contexts/CarSelectionContext.tsx
 *
 * ```typescript
 * import React, { createContext, useContext, useState, useCallback } from 'react';
 * import { Car } from '@/models/Car';
 *
 * interface CarSelectionContextType {
 *   selectedCar: Car | null;
 *   setSelectedCar: (car: Car | null) => void;
 *   requireCar: (callback: (car: Car) => void | Promise<void>) => Promise<void>;
 * }
 *
 * const CarSelectionContext = createContext<CarSelectionContextType | undefined>(undefined);
 *
 * export function CarSelectionProvider({ children }: { children: React.ReactNode }) {
 *   const [selectedCar, setSelectedCar] = useState<Car | null>(() => {
 *     // Hydrate from localStorage on mount
 *     if (typeof window !== 'undefined') {
 *       const stored = localStorage.getItem('selectedCar');
 *       if (stored) {
 *         try {
 *           return JSON.parse(stored);
 *         } catch (e) {
 *           return null;
 *         }
 *       }
 *     }
 *     return null;
 *   });
 *
 *   // Persist to localStorage on change
 *   useEffect(() => {
 *     if (typeof window !== 'undefined') {
 *       if (selectedCar) {
 *         localStorage.setItem('selectedCar', JSON.stringify(selectedCar));
 *       } else {
 *         localStorage.removeItem('selectedCar');
 *       }
 *     }
 *   }, [selectedCar]);
 *
 *   const requireCar = useCallback(
 *     async (callback: (car: Car) => void | Promise<void>) => {
 *       if (selectedCar) {
 *         await Promise.resolve(callback(selectedCar));
 *       } else {
 *         // Open modal logic here (could use a separate state/modal manager)
 *       }
 *     },
 *     [selectedCar]
 *   );
 *
 *   return (
 *     <CarSelectionContext.Provider value={{ selectedCar, setSelectedCar, requireCar }}>
 *       {children}
 *     </CarSelectionContext.Provider>
 *   );
 * }
 *
 * export function useCarSelection() {
 *   const context = useContext(CarSelectionContext);
 *   if (!context) {
 *     throw new Error('useCarSelection must be used within CarSelectionProvider');
 *   }
 *   return context;
 * }
 * ```
 *
 * Usage in app/layout.tsx:
 * ```typescript
 * import { CarSelectionProvider } from '@/contexts/CarSelectionContext';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <CarSelectionProvider>
 *       {children}
 *     </CarSelectionProvider>
 *   );
 * }
 * ```
 */
