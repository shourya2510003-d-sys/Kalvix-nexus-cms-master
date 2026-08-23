"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDelhiveryShipment = void 0;
const axios_1 = require("axios");
const DELHI_API_URL = 'https://track.delhivery.com/api/cmu/create.json';
const API_TOKEN = process.env.DELHIVERY_API_KEY;
const createDelhiveryShipment = async (orderData, addressData, userEmail, userPhone) => {
    if (!API_TOKEN || API_TOKEN === 'delhivery_api_key_placeholder') {
        console.warn("Delhivery API Key not configured. Skipping shipment creation.");
        return null;
    }
    try {
        const payload = {
            format: "json",
            data: {
                shipments: [
                    {
                        name: `${addressData.firstName} ${addressData.lastName}`,
                        add: addressData.streetAddress,
                        pin: addressData.postalCode,
                        city: addressData.city,
                        state: addressData.state,
                        country: addressData.country || "India",
                        phone: userPhone,
                        order: orderData.id,
                        payment_mode: orderData.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
                        return_pin: "",
                        return_city: "",
                        return_phone: "",
                        return_add: "",
                        return_state: "",
                        return_country: "",
                        products_desc: "Kalvix Nexus Products",
                        hsn_code: "",
                        cod_amount: orderData.paymentMethod === 'COD' ? orderData.totalAmount : 0,
                        order_date: new Date().toISOString(),
                        total_amount: orderData.totalAmount,
                        seller_add: "",
                        seller_name: "Kalvix Nexus",
                        seller_inv: "",
                        quantity: 1,
                        waybill: ""
                    }
                ],
                pickup_location: {
                    name: "Kalvix Warehouse",
                    add: "Warehouse Address",
                    city: "New Delhi",
                    pin_code: "110001",
                    country: "India",
                    phone: "9927786200"
                }
            }
        };
        const response = await axios_1.default.post(DELHI_API_URL, `format=json&data=${encodeURIComponent(JSON.stringify(payload.data))}`, {
            headers: {
                'Authorization': `Token ${API_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log("Delhivery Order Creation Response:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Failed to create Delhivery shipment:", error.response?.data || error.message);
        return null;
    }
};
exports.createDelhiveryShipment = createDelhiveryShipment;
//# sourceMappingURL=delhivery.js.map