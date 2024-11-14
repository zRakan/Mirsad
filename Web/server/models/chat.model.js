import { Schema, model} from 'mongoose';

const chatSchema = new Schema({
    id: { type: String, index: true },

    title: String,
    history: Array,

    company: String
});

export const Chat = model('Chat', chatSchema);