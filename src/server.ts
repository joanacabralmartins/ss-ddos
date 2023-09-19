import express, { Request, Response, ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import logger from './logger';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/routes';

dotenv.config();

const server = express();

// regra de limite de taxa 
const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutos 
    limit: 50, // limita cada IP a 50 solicitações por windowMs 
    message: 'Você enviou muitas solicitações. Aguarde um pouco e tente novamente mais tarde.',
})

server.use(limiter);

server.use((req, res, next) => {
    logger.log({
      level: 'info',
      message: `${req.method} ${req.url}`,
    });
    next();
  });

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