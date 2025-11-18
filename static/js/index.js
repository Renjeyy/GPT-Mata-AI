document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.carousel-card');
    const nextBtn = document.querySelector('.carousel-control.next');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const dotsContainer = document.querySelector('.carousel-dots');

    let currentSlide = 0;
    const totalSlides = cards.length;

    // Fungsi untuk membuat indikator dot
    function createDots() {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // Fungsi untuk menampilkan slide tertentu
    function showSlide(index) {
        // Geser track sebesar (index * 100%) ke kiri
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Update indikator dot
        document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
        document.querySelectorAll('.dot')[index].classList.add('active');
        
        currentSlide = index;
    }

    // Fungsi untuk pindah ke slide tertentu
    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            showSlide(index);
        }
    }

    // Event Listener untuk tombol "Next" dengan loop
    nextBtn.addEventListener('click', () => {
        // Gunakan modulo untuk kembali ke 0 jika sudah di slide terakhir
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    });

    // Event Listener untuk tombol "Previous" dengan loop
    prevBtn.addEventListener('click', () => {
        // Gunakan modulo untuk loop ke slide terakhir jika di slide pertama
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    });

    // Inisialisasi
    createDots();
    showSlide(0);
});