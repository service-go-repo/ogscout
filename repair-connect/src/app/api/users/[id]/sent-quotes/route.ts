import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET /api/users/[id]/sent-quotes
 * Fetches all quote requests sent by the user
 * Query params:
 * - carId (optional): Filter by specific car
 * - limit (optional): Limit number of results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Users can only fetch their own sent quotes
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const carId = searchParams.get('carId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query filter
    const filter: any = {
      customerId: new ObjectId(userId),
    };

    if (carId) {
      filter.carId = new ObjectId(carId);
    }

    // Fetch quotations for this user
    const quotations = await db
      .collection('quotations')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Transform to SentQuote format
    const sentQuotes = quotations.flatMap((quotation) => {
      const targetWorkshops = quotation.targetWorkshops || [];

      return targetWorkshops.map((workshopId: ObjectId) => {
        // Find workshop details from quotes array if available
        const quote = quotation.quotes?.find(
          (q: any) => q.workshopId?.toString() === workshopId.toString()
        );

        return {
          carId: quotation.carId?.toString() || '',
          workshopId: workshopId.toString(),
          workshopName: quote?.workshopName || 'Unknown Workshop',
          quotationId: quotation._id.toString(),
          timestamp: quotation.createdAt,
          status: 'submitted' as const,
        };
      });
    });

    return NextResponse.json({
      success: true,
      data: sentQuotes,
    });
  } catch (error) {
    console.error('Error fetching sent quotes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sent quotes' },
      { status: 500 }
    );
  }
}
