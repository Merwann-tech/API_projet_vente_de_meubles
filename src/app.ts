import express, { Application, Request, Response } from 'express';
import { notFound } from './middlewares/notFound';
import router from './routes';
import cors from 'cors';
const app: Application = express();
app.use(cors());


app.use(express.json({
  verify: (req: any, _res, buf: Buffer) => {
    // stocke le buffer brut pour pouvoir vérifier la signature Stripe plus tard
    if (buf && buf.length) {
      req.rawBody = buf;
    }
  },
  // optionnel : limiter la taille des payloads
  limit: '1mb',
}));

app.use('/', router)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello TypeScript with Express!');
});

app.get('/test', (req: Request, res: Response) => {
  res.send('This is a test route' );
});



app.use(notFound);

const PORT : number = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});