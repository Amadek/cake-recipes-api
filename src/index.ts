import express, { Application } from 'express';

const app: Application = express();

app.get('/', (_req: any, res: any) => res.send('CAKE RECIPES!'));
app.listen(3000, () => console.log('Listening on 3000...'));
