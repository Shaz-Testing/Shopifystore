const express = require('express');
const crypto = require('crypto');
const router = express.Router();

router.use('/webhook', express.raw({ type: 'application/json' }));

router.post('/webhook', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;

  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_SHARED_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  if (generatedHash !== hmacHeader) {
    return res.status(401).send('Unauthorized');
  }

  // Process the webhook payload
  const data = JSON.parse(body);
  console.log('Received webhook:', data);

  res.status(200).send('Webhook received');
});

module.exports = router;
