console.log("🧠 index.js loaded and running");
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const SHOP = "eve-furniture-4502.myshopify.com"; // Replace with your store
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

app.post("/update-stock", async (req, res) => {
  const inventoryItemId = req.body?.inventory_item_id;

  if (!inventoryItemId) {
    return res.status(400).send("Missing inventory_item_id");
  }

  try {
    // 1. Get the variant that owns this inventory item
    const variantRes = await axios.get(
      `https://${SHOP}/admin/api/2023-10/variants.json?inventory_item_ids=${inventoryItemId}`,
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
        },
      }
    );

    const variant = variantRes.data.variants[0];
    const productId = variant.product_id;

    // 2. Get all variants of that product
    const allVariantsRes = await axios.get(
      `https://${SHOP}/admin/api/2023-10/products/${productId}/variants.json`,
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
        },
      }
    );

    const allVariants = allVariantsRes.data.variants;

    // 3. Check if any variant is in stock
    const isInStock = allVariants.some((v) => v.inventory_quantity > 0);
    const stockStatus = isInStock ? "In Stock" : "Out of Stock";

    // 4. Update product metafield
    await axios.post(
      `https://${SHOP}/admin/api/2023-10/products/${productId}/metafields.json`,
      {
        metafield: {
          namespace: "custom",
          key: "stock_status",
          type: "single_line_text_field",
          value: stockStatus,
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).send(`Updated product ${productId} to "${stockStatus}"`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error updating stock status");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));

