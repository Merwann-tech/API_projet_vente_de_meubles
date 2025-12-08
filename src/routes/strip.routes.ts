import { Router, Request, Response } from 'express';
const router = Router();

import dotenv from 'dotenv';
import { updateFurnitureStatusToSold } from '../services/furniture.service';
dotenv.config();

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const YOUR_DOMAIN = 'http://localhost:3001';

router.post('/create-checkout-session', async (req, res) => {
    try {
        const body = req.body || {};
        const origin = YOUR_DOMAIN || process.env.FRONTEND_URL || 'http://localhost:3000';


        let line_items;
        if (body.priceId) {
            line_items = [
                {
                    price: body.priceId,
                    quantity: body.quantity ?? 1,
                },
            ];
        } else if (body.amount) {

            line_items = [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: body.product_name ?? 'Produit',
                        },
                        unit_amount: body.amount,
                    },
                    quantity: body.quantity ?? 1,
                },
            ];
        } else {
            return res.status(400).json({ error: 'priceId ou amount requis' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/annonces`,
            metadata: body.metadata,
        });


        return res.json({ url: session.url });
    } catch (err: unknown) {
        console.error('create-checkout-session error', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: errorMessage });
    }
});


router.post('/webhook', async (req: Request & { rawBody?: Buffer }, res: Response) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sigHeader = req.headers['stripe-signature'];
  const sig = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;


  if (!endpointSecret) {
    console.error('La variable d\'environnement STRIPE_WEBHOOK_SECRET n\'est pas définie.');
    return res.status(500).send('Configuration du webhook Stripe manquante.');
  }
  if (!sig) {
    console.error('Missing stripe-signature header');
    return res.status(400).send('Missing stripe-signature header');
  }


  const raw = req.rawBody ?? (Buffer.isBuffer(req.body) ? req.body : undefined);

  if (!raw) {
    console.error('Raw body absent — la vérification de signature est impossible.');
    return res.status(400).send('Raw body absent');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, endpointSecret);
  } catch (err: unknown) {
    const message = typeof err === 'object' && err !== null && 'message' in err ? (err as { message: string }).message : String(err);
    console.error('Erreur de vérification du webhook Stripe:', message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }


  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.annonceId) {
        updateFurnitureStatusToSold(Number(session.metadata.annonceId));
    }
  } else {
    console.log('Received unhandled event type:', event.type);
  }

  return res.status(200).json({ received: true });
});

router.get('/session-status', async (req, res) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  res.send({
    status: session.status,
    customer_email: session.customer_details?.email
  });
});

export { router as stripRoutes };
