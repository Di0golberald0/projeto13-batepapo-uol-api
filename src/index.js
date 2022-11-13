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
    name: joi.string().required()
});

const messageSchema = joi.object({

});

try {
    await mongoClient.connect();
    db = mongoClient.db('batepapo');
} catch (err) {
    console.log(err);
}

app.post("/participants", (req, res) => {
    const participant = req.body;


});

app.listen(process.env.PORT, () => console.log(`Server running in port: ${process.env.PORT}`));