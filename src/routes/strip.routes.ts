import express , { Router, Request, Response } from 'express';
const router = Router();
router.use(express.json());
router.use(express.static('public'));
// This is your test secret API key.
import dotenv from 'dotenv';
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY as string);

const YOUR_DOMAIN = 'http://localhost:3001';
// Endpoint pour créer une session de paiement Stripe
router.post('/create-checkout-session', async (req, res) => {
    try {
        const body = req.body || {};
        const origin = YOUR_DOMAIN || process.env.FRONTEND_URL || 'http://localhost:3000';

        // Prépare line_items selon priceId ou amount
        let line_items;
        if (body.priceId) {
            line_items = [
                {
                    price: body.priceId,
                    quantity: body.quantity ?? 1,
                },
            ];
        } else if (body.amount) {
            // amount attendu en cents
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

        // Retourne l'URL de redirection vers Stripe
        return res.json({ url: session.url });
    } catch (err: any) {
        console.error('create-checkout-session error', err);
        return res.status(500).json({ error: err.message });
    }
});

// Endpoint webhook Stripe pour écouter les événements de paiement
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error('Erreur de vérification du webhook Stripe:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Vérifie si le paiement est réussi
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Ici, modifie la base de données selon tes besoins
        // Par exemple, marque la commande comme payée
        // await updateOrderStatus(session.id, 'paid');
        console.log('Paiement réussi pour la session:', session.id);
        console.log(session);
        // Ajoute ici ta logique de modification de la base de données
    }

    res.status(200).json({ received: true });
});

router.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email
  });
});

export { router as stripRoutes };
