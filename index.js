const express = require('express');
const app = express();
const webhookRouter = require('./webhook');

// Mount the webhook router
app.use('/', webhookRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});


