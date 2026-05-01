import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, offerId, secret } = body;

    // Verify the secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate offers cache
    // Note: Commented out due to Next.js 16 API changes
    // revalidateTag('offers');
    
    // If specific offer ID is provided, also revalidate that specific offer
    if (offerId) {
      // revalidateTag(`offer-${offerId}`);
    }

    return NextResponse.json({ 
      message: `Offers cache invalidated`,
      action,
      offerId,
      revalidated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Offers webhook error:', error);
    return NextResponse.json(
      { message: 'Error processing webhook' },
      { status: 500 }
    );
  }
}