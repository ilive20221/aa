const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = Stripe("sk_test_51OtRFvKB41VZNDGZi6PNyzZFpsAj9A4zUPRosRdOcXBDf2vxESMfKJsOBOWlMiRYgVEOH47FY4GGwFKtgcPpb5Sw00xrn0PtAC"); // Stripeの秘密鍵

// ミドルウェア設定
app.use(cors());
app.use(express.json());

// /payment-sheet エンドポイントの実装
app.post("/payment-sheet", async (req, res) => {
    try {
        // 1. Customerを作成
        const customer = await stripe.customers.create();

        // 2. Ephemeral Key（顧客の一時キー）を作成
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: "2022-11-15" } // 必須: 最新のStripe APIバージョンを指定
        );

        // 3. PaymentIntentを作成
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 680, // 金額: 例として$10.99
            currency: "jpy", // 通貨
            customer: customer.id, // Customer IDを紐付け
            automatic_payment_methods: { enabled: true }, // 自動支払い方法を有効化
        });

        // 4. 必要な情報をクライアントに返却
        res.json({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: "pk_test_51OtRFvKB41VZNDGZtBtbOkQCInx95sHHZpG1QvINyIUt83ZBWeU74sMJN2YwRCG34hwG4kKze6WOx3jqDS76Us6a00ITzWySUg", // Stripeの公開可能キー
        });
    } catch (error) {
        console.error("エラー:", error);
        res.status(500).json({ error: error.message });
    }
});

// サーバーを起動
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
