from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "<h1>Halo, ini hanya tes!</h1>"

if __name__ == '__main__':
    print("Mencoba menjalankan server Flask murni...")
    try:
        app.run(debug=True, host='127.0.0.1', port=5000)
    except Exception as e:
        print(f"❌ TERJADI ERROR: {e}")
        import traceback
        traceback.print_exc()