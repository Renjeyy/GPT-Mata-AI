import os
import time
import torch
import timm 
import time
import torchvision.transforms as transforms
from PIL import Image
from dotenv import load_dotenv
import httpx

load_dotenv()

try:
    API_KEY = os.getenv("GOOGLE_API_KEY")
    if not API_KEY:
        raise ValueError("API Key tidak ditemukan di file .env")
    print("API Key Google Gemini berhasil dimuat.")
except Exception as e:
    print(f"Gagal memuat API Key Google Gemini: {e}")
    exit()


NUM_CLASSES = 4 
CLASS_NAMES = ['amd', 'cataract', 'diabetes', 'normal'] 
MODEL_FILE_PATH = os.path.join('model', 'vit_eye_disease_model.pth')

try:
    model_architecture = timm.create_model(
        'vit_base_patch16_224', 
        pretrained=False,        
        num_classes=NUM_CLASSES  
    )
    print(f"Arsitektur model TIMM 'vit_base_patch16_224' berhasil disiapkan untuk {NUM_CLASSES} kelas.")
except Exception as e:
    print(f"Error saat membuat model 'timm': {e}")

try:
    model_architecture.load_state_dict(torch.load(MODEL_FILE_PATH, map_location=torch.device('cpu')))
    print(f"Berhasil memuat bobot model dari {MODEL_FILE_PATH}")
except Exception as e:
    print(f"--- GAGAL MEMUAT MODEL ---")
    print(f"Error: {e}")

model_architecture.eval()

preprocess = transforms.Compose([
    transforms.Resize(256),         
    transforms.CenterCrop(224),     
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def get_model_prediction(image_path):
    print(f"--- MODEL GAMBAR (AKTIF-TIMM): Menganalisis {image_path} ---")
    
    try:
        image = Image.open(image_path).convert('RGB')
        img_t = preprocess(image)
        batch_t = torch.unsqueeze(img_t, 0)

        with torch.no_grad():
            out = model_architecture(batch_t) 
        
        probabilities = torch.nn.functional.softmax(out[0], dim=0)
        top_prob, top_class_idx = torch.max(probabilities, 0)
        
        predicted_class = CLASS_NAMES[top_class_idx.item()]
        confidence = top_prob.item() * 100

        prediction_text = f"Hasil analisis: Terdapat {confidence:.2f}% kemungkinan terdeteksi **{predicted_class}**."
        advice_text = ("**PENTING:** Hasil ini adalah prediksi AI dan BUKAN diagnosis medis."
                       " Harap segera konsultasikan dengan dokter atau tenaga medis profesional untuk diagnosis yang akurat.")

        return prediction_text, advice_text

    except Exception as e:
        print(f"Error saat prediksi gambar: {e}")
        return "Error: Gagal memproses gambar", f"Detail error: {e}"

def get_text_response(user_message):
    """
    Fungsi ini menggunakan httpx untuk memanggil Google Gemini API secara langsung.
    (VERSI DENGAN COBA LAGI OTOMATIS UNTUK ERROR 503)
    """
    print(f"Menerima pesan teks: {user_message}")
    
    system_prompt = """
    Anda adalah Agus Kopling, asisten AI yang ramah, sedikit lucu, dan berpengetahuan tentang kesehatan, terutama kesehatan mata.
    Tugas Anda adalah menjawab pertanyaan pengguna dengan cara yang informatif, mudah dimengerti, dan **sangat terstruktur**.

    **PENTING: Format Jawaban Anda HARUS mengikuti aturan berikut:**
    1.  **Struktur Cluster**: Jika menjelaskan suatu kondisi atau topik, pisahkan informasi menjadi cluster dengan heading yang jelas. Gunakan heading berikut jika relevan:
        *   **Pengertian:**
        *   **Penyebab:**
        *   **Gejala Umum:**
        *   **Saran Agus:**
        *   **Kapan Harus ke Dokter:**
        *   Heading lain yang sesuai dengan topik.
    2.  **Pentingnya Disclaimer**: Selalu ingatkan pengguna bahwa Anda bukan dokter. Sertakan kalimat: *"Ingat ya, ini semua sekadar informasi dari Agus, bukan diagnosis medis. Untuk yang pastinya, konsultasi sama dokter ya!"* di bagian akhir atau di bawah "Saran Agus".
    3.  **Format Teks**: Gunakan **Markdown** untuk memformat teks.
        *   Untuk teks yang penting atau bold, gunakan dua bintang: **ini contoh teks bold**.
        *   Untuk daftar, gunakan tanda bintang atau strip di awal baris.
        *   Untuk heading, gunakan tanda pagar (#). Contoh: ### Pengertian:

    Jawablah dengan bahasa yang santai dan ringan, sesuai kepribadian Agus Kopling.
    """
    
    combined_prompt = f"{system_prompt}\n\nPertanyaan pengguna: {user_message}"
    model_name = "gemini-2.5-flash" 
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": combined_prompt}],
            "role": "user"
        }]
    }

    max_retries = 3
    for attempt in range(max_retries):
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, json=payload)
                response.raise_for_status()
                
                response_data = response.json()
                bot_response = response_data['candidates'][0]['content']['parts'][0]['text'].strip()
                return bot_response

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 503:
                print(f"Peringatan: Server AI sibuk (503). Mencoba ulang... (Percobaan {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    return "Server AI sedang sangat sibuk. Mohon tunggu beberapa saat dan coba lagi ya."
            else:
                print(f"Error HTTP dari Gemini API: {e.response.status_code} - {e.response.text}")
                return f"Server AI merespons dengan error: {e.response.status_code}."
        
        except Exception as e:
            print(f"Error umum saat memanggil Gemini API: {e}. Mencoba ulang... (Percobaan {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            else:
                return "Waduh, saya lagi nggak bisa konek ke server Google. Coba lagi nanti ya."

    return "Terjadi kesalahan yang tidak diketahui setelah beberapa kali percobaan."

def get_disease_comment(predicted_disease):
    print(f"Meminta tanggapan untuk penyakit: {predicted_disease}")

    comment_prompt = f"""
    Anda adalah Agus Kopling. Dari gambar yang sudah dikirim, Tolong Anda berikan beberapa hal berikut
    1. Tanggapan mengenai penyakit yang terdeteksi yaitu **{predicted_disease}**.
    2. Berikan saran singkat dan ramah untuk pengguna yang mungkin mengalami penyakit **{predicted_disease}**.
    3. Tetap menyarakan untuk konsultasi dengan dokter meskipun sudah ada prediksi AI.
    4. Gunakan bahasa yang santai, ramah, dan mudah dimengerti.
    """
    
    model_name = "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": comment_prompt}],
            "role": "user"
        }]
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            
            response_data = response.json()
            comment = response_data['candidates'][0]['content']['parts'][0]['text'].strip()
            return comment

    except Exception as e:
        print(f"Gagal mendapatkan tanggapan dari Agus: {e}")
        return "Agus lagi bingung mau ngomong apa, yang penting jangan lupa periksa ke dokter ya!"