import express, { Application, Request, Response } from 'express';
import { notFound } from './middlewares/notFound';

const app: Application = express();



app.get('/', (req: Request, res: Response) => {
  res.send('Hello TypeScript with Express!');
});

app.get('/test', (req: Request, res: Response) => {
  res.send('This is a test route' );
});



app.use(notFound);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});