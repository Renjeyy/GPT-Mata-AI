document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById('disease-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close');
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');

    // Data detail penyakit yang sangat terstruktur
    const diseaseDetails = {
        'amd': {
            title: 'Degenerasi Makula Terkait Usia (AMD)',
            content: `
                <h4>Definisi</h4>
                <p style="text-align: justify;">Degenerasi Makula Terkait Usia (AMD) adalah kondisi mata yang memengaruhi bagian tengah retina (makula), yang bertanggung jawab untuk penglihatan tajam, detail, dan pusat. AMD menyebabkan kerusakan pada makula, yang dapat mengakibatkan hilangnya penglihatan sentral, sementara penglihatan perifer (samping) tetap terjaga. Ini adalah penyebab utama kebutaan pada orang berusia di atas 60 tahun di negara-negara berkembang.</p>
                
                <h4>Gejala</h4>
                <ul>
                    <li>Penglihatan kabur atau buram, terutama saat membaca atau melakukan pekerjaan dekat.</li>
                    <li>Garis lurus terlihat melengkung atau bergelombang (metamorfopsia).</li>
                    <li>Area buta atau titik gelap di tengah bidang penglihatan.</li>
                    <li>Kesulitan mengenali wajah.</li>
                    <li>Membutuhkan cahaya yang lebih terang untuk melihat.</li>
                    <li>Penurunan intensitas atau kecerahan warna.</li>
                </ul>

                <h4>Diagnosis</h4>
                <ul>
                    <li><strong>Pemeriksaan Mata Rutin:</strong> Dokter mata akan memeriksa bagian belakang mata Anda untuk mencari tanda-tanda AMD.</li>
                    <li><strong>Grid Amsler:</strong> Alat sederhana berupa kisi-kisi yang dapat digunakan di rumah untuk mendeteksi perubahan penglihatan pusat.</li>
                    <li><strong>Angiografi Fluorescein (FA):</strong> Pewarna khusus disuntikkan ke pembuluh darah untuk memotret aliran darah di retina dan mengidentifikasi pembuluh darah abnormal.</li>
                    <li><strong>Tomografi Koherensi Optik (OCT):</strong> Pemindaian non-invasif yang memberikan gambar detail berlapis dari retina untuk mendeteksi penebalan atau cairan di bawah makula.</li>
                </ul>

                <h4>Penanganan</h4>
                <ul>
                    <li><strong>AMD Kering:</strong> Tidak ada obat untuk menyembuhkan, tetapi penundaan perkembangannya dapat dilakukan dengan suplemen vitamin berdasarkan formula AREDS2 (vitamin C, E, lutein, zeaxanthin, seng, dan tembaga).</li>
                    <li><strong>AMD Basah:</strong> Pengobatan meliputi suntikan anti-VEGF (seperti ranibizumab, aflibercept, atau bevacizumab) langsung ke mata untuk menghentikan pertumbuhan pembuluh darah abnormal dan mengurangi kebocoran. Terapi fotodinamik juga bisa menjadi pilihan.</li>
                    <li><strong>Rehabilitasi Penglihatan Rendah:</strong> Menggunakan alat bantu seperti lensa pembesar, terapi pencahayaan khusus, dan perangkat elektronik untuk memaksimalkan sisa penglihatan.</li>
                </ul>

                <h4>Komplikasi</h4>
                <ul>
                    <li><strong>Kehilangan Penglihatan Sentral yang Permanen:</strong> Ini adalah komplikasi utama yang dapat secara signifikan menurunkan kualitas hidup.</li>
                    <li><strong>Kehilangan Kemampuan Membaca dan Mengemudi:</strong> Ketergantungan pada orang lain untuk aktivitas sehari-hari.</li>
                    <li><strong>Depresi dan Isolasi Sosial:</strong> Kesulitan dalam melihat wajah dan melakukan hobi dapat menyebabkan masalah kesehatan mental.</li>
                    <li><strong>Penurunan Kemandirian:</strong> Kesulitan dalam melakukan tugas-tugas rumah tangga dan perawatan diri.</li>
                </ul>
            `
        },
        'diabetic-retinopathy': {
            title: 'Diabetik Retinopati',
            content: `
                <h4>Definisi</h4>
                <p style="text-align: justify;">Diabetik Retinopati adalah komplikasi diabetes yang memengaruhi mata. Kondisi ini disebabkan oleh kerusakan pada pembuluh darah halus yang memasok jaringan saraf di belakang mata (retina). Ketika pembuluh darah ini rusak, mereka bisa membengkak, bocor, atau tersumbat, yang mengganggu aliran darah normal. Pada tahap lanjut, retina dapat tumbuh pembuluh darah baru yang abnormal dan rapuh, yang mudah berdarah. Jika tidak ditangani, diabetik retinopati dapat menyebabkan kebutaan.</p>
                
                <h4>Gejala</h4>
                <ul>
                    <li>Seringkali tidak ada gejala pada tahap awal (non-proliferatif).</li>
                    <li>Bintik-bintik terapung atau "cobekan" yang melayang di bidang penglihatan (floaters).</li>
                    <li>Penglihatan kabur yang datang dan pergi.</li>
                    <li>Penglihatan berwarna menjadi kusam atau pudar.</li>
                    <li>Area gelap atau kosong di bidang penglihatan.</li>
                    <li>Kehilangan penglihatan tiba-tiba dan menyakitkan (pada tahap lanjut saat perdarahan terjadi).</li>
                </ul>

                <h4>Diagnosis</h4>
                <ul>
                    <li><strong>Pemeriksaan Mata Dilatasi:</strong> Dokter meneteskan tetes mata untuk melebarkan pupil dan memeriksa retina dengan lebih jelas.</li>
                    <li><strong>Fotofundus:</strong> Mengambil foto retina untuk mendokumentasikan perubahan dari waktu ke waktu.</li>
                    <li><strong>Tomografi Koherensi Optik (OCT):</strong> Memberikan gambar detail berlapis dari retina untuk mendeteksi pembengkakan (edema makula).</li>
                    <li><strong>Angiografi Fluorescein (FA):</strong> Sama seperti pada AMD, digunakan untuk melihat pembuluh darah yang bocor atau tersumbat.</li>
                </ul>

                <h4>Penanganan</h4>
                <ul>
                    <li><strong>Kontrol Gula Darah:</strong> Ini adalah langkah terpenting untuk mencegah atau memperlambat perkembangan. Jaga gula darah, tekanan darah, dan kolesterol Anda dalam rentang target.</li>
                    <li><strong>Laser Fotokoagulasi:</strong> Sinar laser digunakan untuk menyegel pembuluh darah yang bocor atau mengecilkan pembuluh darah abnormal.</li>
                    <li><strong>Injeksi Anti-VEGF:</strong> Suntikan obat (seperti ranibizumab) ke dalam mata untuk mengurangi pembengkakan dan menghambat pertumbuhan pembuluh darah baru.</li>
                    <li><strong>Vitrektomi:</strong> Operasi untuk menghapus darah dari bagian tengah mata (vitreus) dan jaringan parut yang menarik pada retina.</li>
                </ul>

                <h4>Komplikasi</h4>
                <ul>
                    <li><strong>Edema Makula Diabetik:</strong> Pembengkakan area penglihatan tajam (makula) yang dapat menyebabkan penglihatan kabur.</li>
                    <li><strong>Retinopati Proliferatif:</strong> Tahap lanjut dengan pertumbuhan pembuluh darah baru yang rapuh, berisiko tinggi perdarahan vitreus.</li>
                    <li><strong>Detasemen Retina:</strong> Jaringan parut dapat menarik retina menjauh dari dinding belakang mata, menyebabkan kehilangan penglihatan permanen.</li>
                    <li><strong>Glaukoma Neovaskular:</strong> Pembuluh darah baru dapat tumbuh di iris dan menyumbat saluran cairan mata, meningkatkan tekanan intraokular dan merusak saraf optik.</li>
                </ul>
            `
        },
        'cataract': {
            title: 'Katarak',
            content: `
                <h4>Definisi</h4>
                <p style="text-align: justify;">Katarak adalah pengaburan atau keruh pada lensa mata, yang biasanya bening. Lensa mata terletak di belakang iris dan pupil, berfungsi seperti lensa kamera untuk memfokuskan cahaya ke retina. Ketika lensa menjadi keruh, cahaya tidak dapat melaluinya dengan mudah, dan penglihatan menjadi kabur atau suram. Katarak berkembang perlahan dan dapat memengaruhi satu atau kedua mata. Ini adalah penyebab utama kebutaan di seluruh dunia, tetapi dapat disembuhkan dengan operasi.</p>
                
                <h4>Gejala</h4>
                <ul>
                    <li>Penglihatan kabur, suram, atau kurang tajam, seolah-olah melihat melalui kaca buram.</li>
                    <li>Kesulitan melihat di malam hari, terutama saat mengemudi.</li>
                    <li>Sensitif terhadap cahaya (silau) atau melihat "halo" di sekitar lampu.</li>
                    <li>Warna tampak pudar atau kurang cerah.</li>
                    <li>Membutuhkan cahaya yang lebih terang untuk membaca dan melakukan aktivitas lain.</li>
                    <li>Penglihatan ganda atau banyak bayangan pada satu mata.</li>
                    <li>Pembesaran resep kacamata atau lensa kontak yang sering berubah.</li>
                </ul>

                <h4>Diagnosis</h4>
                <ul>
                    <li><strong>Pemeriksaan Mata Komprehensif:</strong> Dokter mata akan melakukan serangkaian tes.</li>
                    <li><strong>Tes Ketajaman Visual:</strong> Membaca huruf dari bagan untuk menilai seberapa jauh Anda bisa melihat pada berbagai jarak.</li>
                    <li><strong>Slit-Lamp Examination:</strong> Mikroskop khusus untuk memeriksa struktur bagian depan mata, termasuk lensa, untuk mendeteksi kekeruhan.</li>
                    <li><strong>Retinal Examination:</strong> Setelah pupil dilebarkan, dokter akan memeriksa retina untuk memastikan tidak ada masalah lain yang menyebabkan gejala Anda.</li>
                </ul>

                <h4>Penanganan</h4>
                <ul>
                    <li><strong>Pengelolaan Dini:</strong> Pada tahap awal, perubahan resep kacamata, pencahayaan yang lebih baik, dan kacamata hitam anti-silau mungkin membantu.</li>
                    <li><strong>Operasi Katarak:</strong> Ini adalah satu-satunya pengobatan yang efektif. Prosedurnya melibatkan pengangkatan lensa alami yang keruh dan menggantinya dengan lensa buatan (intraocular lens/IOL) yang permanen. Operasi ini umumnya aman, cepat, dan sangat efektif.</li>
                </ul>

                <h4>Komplikasi</h4>
                <ul>
                    <li><strong>Kehilangan Penglihatan:</strong> Jika tidak diobati, katarak dapat berkembang menjadi kebutaan total.</li>
                    <li><strong>Penurunan Kualitas Hidup:</strong> Kesulitan dalam melakukan aktivitas sehari-hari seperti membaca, menyetir, atau menonton TV dapat menyebabkan frustrasi dan isolasi sosial.</li>
                    <li><strong>Komplikasi Operasi (Jarang Terjadi):</strong> Meskipun jarang, operasi katarak memiliki risiko seperti infeksi, peradangan, perdarahan, detasemen retina, atau pembengkakan makula.</li>
                    <li><strong>Glaukoma Sekunder:</strong> Katarak yang sangat lanjut dan membesar (hipermatur) dapat menyebabkan peningkatan tekanan intraokular.</li>
                </ul>
            `
        }
    };

    learnMoreButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const diseaseKey = event.target.getAttribute('data-disease');
            const details = diseaseDetails[diseaseKey];

            if (details) {
                modalTitle.textContent = details.title;
                modalBody.innerHTML = details.content;
                modalOverlay.classList.remove('hidden');
            }
        });
    });

    function closeModal() {
        modalOverlay.classList.add('hidden');
    }

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
});