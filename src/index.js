import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

const participantSchema = joi.object({
    name: joi.string().alphanum().min(1).required()
});

const messageSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().alphanum().min(1).required(),
    text: joi.string().alphanum().min(1).required(),
    type: joi.string().valid('message', 'private message').required(),
    time: joi.string().required()
});

try {
    await mongoClient.connect();
    db = mongoClient.db('batepapouol');
} catch (err) {
    console.log(err);
}

app.post('/participants', async (req, res) => {
    const participant = req.body;

    const validation = participantSchema.validate(participant, { abortEarly: false });

    if(validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(422).send(erros);
        return;
    }

    try {
        const participantExists = await db.collection('participants').findOne({ name: participant.name });
        
        if(participantExists) {
            res.sendStatus(409);
            return;
        }

        await db.collection('participant').insertOne({ name: participant.name, lastStatus: Date.now() });

        await db.collection('messages').insertOne({ from: participant.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs.format('HH:MM:SS') })

        res.sendStatus(201);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.get('/participants', async (req, res) => {
    try {
        const participants = await db.collection('participant').find().toArray();

        if(!participants) {
            res.status(404).send('Nenhum participante encontrado');
            return;
        }
    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.post('/messages', async (req, res) => {
    const { to, text, type } = req.body;
    const { user } = req.headers;

    const message = {
        from: user,
        to,
        text,
        type,
        time: dayjs().format('HH:MM:SS')
    }

    const validation = messageSchema.validate(message, { abortEarly: false });

    if(validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(422).send(erros);
        return;
    }


    try {
        const participantExists = await db.collection('participants').findOne({ name: user });

        if(!participantExists) {
            res.sendStatus(409);
            return;
        }

        await db.collection('messages').insertOne(message);

        res.sendStatus(201);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.get('/messages', async (req, res) => {
    const limit = parseInt(req.query.limit);
    const { user } = req.headers;

    try {
        const allMessages = await db.collection('messages').find().toArray();
        const visableMessages = allMessages.filter((message) => {
            // ?!?
        });

        if(limit && limit !== NaN) {
            return res.send(visableMessages.slice(-limit));
        }

        res.send(visableMessages);
    } catch(error) {
        res.status(500).send(error.message);
    }
})

app.listen(process.env.PORT, () => console.log(`Server running in port: ${process.env.PORT}`));