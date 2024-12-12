const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');

const usersRouter = require('./routes/usersRouter');
const eventsRouter = require('./routes/eventsRouter');
const citiesRouter = require('./routes/citiesRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const groupRouter = require('./routes/groupRouter');
const photosRouter = require('./routes/photosRouter');
const blogRouter = require('./routes/blogsRouter');
const Message = require('./models/Message');
const Group = require('./models/Group');
const User = require('./models/User');
const groupController = require('./controllers/groupController');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        console.log(`User joined group: ${groupId}`);
    });

    socket.on('sendMessage', async ({ groupId, userId, content }) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                console.error('User not found');
                return;
            }

            const message = new Message({ group: groupId, author: userId, content });
            await message.save();

            await Group.findByIdAndUpdate(groupId, { $push: { messages: message._id } });

            io.to(groupId).emit('receiveMessage', {
                groupId,
                author: user.firstname,
                content,
                timestamp: message.timestamp,
            });

            console.log('Message sent:', message);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

const upload = multer({ dest: 'uploads/' });

const mongoDB = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_SERVER}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

async function main() {
    try {
        if (process.env.NODE_ENV !== 'test') {
            await mongoose.connect(mongoDB);
            console.log('Connected to MongoDB');
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}
main();

app.use('/', usersRouter);
app.use('/events', eventsRouter);
app.use('/cities', citiesRouter);
app.use('/categories', categoriesRouter);
app.use('/groups', groupRouter);
app.use('/photos', photosRouter);
app.use('/forgotpassword', usersRouter);
app.use('/blogs', blogRouter);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

cron.schedule('*/2 * * * *', () => {
    console.log('Executing user grouping task every 2 minutes...');
    groupController.createGroupsForEvents();
});

module.exports = { app };
