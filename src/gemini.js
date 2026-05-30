import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== "YOUR_GEMINI_KEY_HERE") {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Helper to convert File to Base64
const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    },
  };
}

export const scanReceipt = async (imageFile) => {
  if (!genAI) {
    throw new Error("Gemini API Key belum dikonfigurasi di file .env");
  }

  try {
    // For multimodal tasks, gemini-2.5-flash is extremely fast and cost-effective
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Anda adalah asisten keuangan pintar. Baca struk belanja ini dan ekstrak informasi berikut ke dalam format JSON yang valid.
    Jangan berikan teks apapun selain JSON.
    Format JSON yang diharapkan:
    {
      "merchant": "Nama Toko/Merchant (string)",
      "amount": "Total Harga atau Grand Total (angka tanpa titik pemisah, contoh: 150000)",
      "items_detail": "Daftar lengkap seluruh barang yang dibeli beserta harganya, diformat rapi menggunakan baris baru (\\n). Contoh: '1x Nasi Goreng - Rp 25.000\\n2x Es Teh - Rp 10.000'"
    }
    Jika tidak menemukan nama toko, gunakan "Toko Tidak Diketahui".
    Jika tidak menemukan nominal, gunakan 0.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting and conversation text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI tidak mengembalikan format JSON yang valid. Respons mentah: " + text.substring(0, 50));
    }
    
    return JSON.parse(match[0]);
    
  } catch (error) {
    console.error("Error OCR Gemini:", error);
    // Tampilkan pesan error asli agar lebih mudah di-debug
    throw new Error("Gagal: " + (error.message || "Kesalahan tidak diketahui"));
  }
}
