const express = require('express');
const bodyParser = require('body-parser');
const mailgun = require('mailgun-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

app.post('/send-email', (req, res) => {
    const { from, to, subject, text } = req.body;

    const data = {
        from,
        to,
        subject,
        text
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json({ message: 'Email sent successfully', body });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
