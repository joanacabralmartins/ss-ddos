import express, { Request, Response, ErrorRequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit'
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/routes';

dotenv.config();

const server = express();

// regra de limite de taxa 
const limiter = rateLimit({ 
    windowMs: 1 * 60 * 1000, // 1 minuto 
    limit: 2 // limita cada IP a 2 solicitações por windowMs 
})

server.use(limiter);

server.use(cors());

server.use(express.static(path.join(__dirname, '../public')));

//AQUI EU DIGO O FORMATO QUE EU QUERO A REQUISIÇÃO
//server.use(express.urlencoded({ extended: true })); // USANDO URL ENCODED
server.use(express.json()); //USANDO JSON

server.get('/ping', (req: Request, res: Response) => res.json({ pong: true }));

server.use(apiRoutes);

server.use((req: Request, res: Response) => {
    res.status(404);
    res.json({ error: 'Endpoint não encontrado.' });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(400); // Bad Request
    console.log(err);
    res.json({ error: 'Ocorreu algum erro.' });
}
server.use(errorHandler);

server.listen(process.env.PORT);