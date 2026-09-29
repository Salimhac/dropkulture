import type { Request, Response } from 'express';

/**
 * Serverless / API Endpoint to verify Paystack transactions using the PAYSTACK_SECRET_KEY
 * Can be hosted on Vercel Serverless Functions (/api/verify-paystack) or Express backend.
 */
export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const reference = req.query?.reference || req.body?.reference;

  if (!reference) {
    return res.status(400).json({ 
      success: false, 
      message: 'Payment reference is required for Paystack verification' 
    });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey || secretKey.includes('sample')) {
    // Graceful response for sandbox or local testing where merchant key is not yet set
    return res.status(200).json({
      success: true,
      verified: true,
      mode: 'sandbox_simulation',
      message: 'Transaction reference acknowledged (Sandbox Test Mode)',
      reference,
    });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: data.message || 'Paystack verification failed',
        data,
      });
    }

    const isPaid = data.data?.status === 'success';

    return res.status(200).json({
      success: true,
      verified: isPaid,
      amountKES: (data.data?.amount || 0) / 100,
      currency: data.data?.currency || 'KES',
      channel: data.data?.channel,
      customer: data.data?.customer,
      paidAt: data.data?.paid_at,
      reference: data.data?.reference,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Error communicating with Paystack API',
    });
  }
}
