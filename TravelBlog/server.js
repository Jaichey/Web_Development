const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/Travel_Blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Failed to connect to MongoDB:', error);
});

// Define Schema and Model
const TaskSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Username: { type: String, required: true,unique: true},
    Email: { type: String, required: true },
    DOB: { type: String },
    Nationality: { type: String },
    HomeAddress: { type: String },
    Contact: { type: String },
    hobbies: { type: String },
    Travel_History: { type: String },
    Password: { type: String, required: true },
});

// Pre-save Hook for Password Hashing
TaskSchema.pre('save', async function (next) {
    if (this.isModified('Password')) {
        this.Password = await bcrypt.hash(this.Password, 10);
    }
    next();
});

const TaskModel = mongoose.model('tasks', TaskSchema);

// Routes
app.get('/getDetails', async (req, res) => {
    try {
        const users = await TaskModel.find({}, { _id: 0, __v: 0 });
        const tasksText = users.map(user => {
            return [
                user.Name,
                user.Username,
                user.Email,
                user.DOB,
                user.Nationality,
                user.HomeAddress,
                user.Contact,
                user.hobbies,
                user.Travel_History,
            ].filter(task => task).join('\n');
        }).join('\n\n');

        res.setHeader('Content-Type', 'text/plain');
        res.send(tasksText);
    } catch (error) {
        console.error('Error fetching details:', error);
        res.status(500).send('An error occurred while fetching details.');
    }
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Serve Signup Page
app.get('/SignUp', (req, res) => {
    const filePath = path.resolve(__dirname, 'TravelBlog_login.html');
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File not found:', err);
            return res.status(404).send('Signup page not found.');
        }
        res.sendFile(filePath);
    });
});

// Handle POST Request to Save Data
app.post('/post', async (req, res) => {
    const {
        Name, Username, Email, DOB, Nationality,
        HomeAddress, Contact, hobbies, Travel_History, Password
    } = req.body;

    // Validate Required Fields
    if (!Name || !Username || !Email || !Password) {
        return res.status(400).send('Missing required fields: Name, Username, Email, or Password');
    }

    try {
        const task = new TaskModel({
            Name,
            Username,
            Email,
            DOB,
            Nationality,
            HomeAddress,
            Contact,
            hobbies,
            Travel_History,
            Password,
        });
        await task.save();
        console.log('Profile Created:', task);
        res.send('Details submitted successfully');
    } catch (error) {
        console.error('Error saving details:', error);
        res.status(500).send('Failed to save details');
    }
});
// API route to fetch all user details
// app.get('/getAllDetails', async (req, res) => {
//     try {
//         const users = await TaskModel.find();
//         res.json(users); // Send all details as JSON
//     } catch (error) {
//         console.error('Error fetching details:', error);
//         res.status(500).send('Failed to fetch details');
//     }
// });

app.post('/login', async (req, res) => {
    const { Username, Password } = req.body;

    try {
        // Find user by username
        const user = await TaskModel.findOne({ Username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(Password, user.Password);
        if (isMatch) {
            res.send('Login successful!');
        } else {
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred during login');
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

async function fetchDetails() {
    try {
        // Fetch all records
        const users = await TaskModel.find();

        // Process each record and store in variables
        users.forEach(user => {
            const name = user.Name;
            const username = user.Username;
            const email = user.Email;
            const dob = user.DOB;
            const nationality = user.Nationality;
            const homeAddress = user.HomeAddress;
            const contact = user.Contact;
            const hobbies = user.hobbies;
            const travelHistory = user.Travel_History;
            const password = user.Password;

            // Log each record's details
            console.log('User Details:');
            console.log(`Name: ${name}`);
            console.log(`Username: ${username}`);
            console.log(`Email: ${email}`);
            console.log(`DOB: ${dob}`);
            console.log(`Nationality: ${nationality}`);
            console.log(`Home Address: ${homeAddress}`);
            console.log(`Contact: ${contact}`);
            console.log(`Hobbies: ${hobbies}`);
            console.log(`Travel History: ${travelHistory}`);
            console.log(`Password: ${password}`);
            console.log('---------------------------');
        });

        // Close the database connection after fetching details
        //mongoose.connection.close();
    } catch (error) {
        console.error('Error fetching details:', error);
        //mongoose.connection.close();
    }
}

// Call the function to fetch details
fetchDetails();

app.delete('/deleteUser/:Username', async (req, res) => {
    const username = req.params.Username;

    try {
        const result = await TaskModel.findOneAndDelete({ Username: username });
        if (result) {
            res.status(200).send('User deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Failed to delete user');
    }
});


