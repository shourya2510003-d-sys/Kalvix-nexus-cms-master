import axios from 'axios';

const DELHI_API_URL = 'https://track.delhivery.com/api/cmu/create.json';
const API_TOKEN = process.env.DELHIVERY_API_KEY;

export const createDelhiveryShipment = async (orderData: any, addressData: any, userEmail: string, userPhone: string) => {
  if (!API_TOKEN || API_TOKEN === 'delhivery_api_key_placeholder') {
    console.warn("Delhivery API Key not configured. Skipping shipment creation.");
    return null;
  }

  try {
    // Mapping the data to Delhivery's required format
    // https://delhivery.com/docs
    
    // Example format, may need adjustment based on Delhivery's latest API specs
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
            quantity: 1, // You could aggregate quantity
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

    const response = await axios.post(DELHI_API_URL, `format=json&data=${encodeURIComponent(JSON.stringify(payload.data))}`, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log("Delhivery Order Creation Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create Delhivery shipment:", error.response?.data || error.message);
    // Returning null instead of throwing so checkout doesn't fail if Delhivery API is down
    return null;
  }
};
