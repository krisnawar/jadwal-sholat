document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const citySelect = document.getElementById('citySelect');
    const dateInput = document.getElementById('dateInput');
    const searchForm = document.getElementById('searchForm');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    // Header Elements
    const headerCity = document.getElementById('headerCity');
    const headerDate = document.getElementById('headerDate');
    const headerMonth = document.getElementById('headerMonth');
    const countdownContainer = document.getElementById('countdownContainer');
    const nextPrayerNameElem = document.getElementById('nextPrayerName');
    const nextPrayerTimeElem = document.getElementById('nextPrayerTime');

    // Table Elements
    const singleDayGrid = document.getElementById('singleDayGrid');
    const monthlyRows = document.getElementById('monthlyRows');

    // Ayah Elements
    const ayahHeader = document.getElementById('ayahHeader');
    const ayahArab = document.getElementById('ayahArab');
    const ayahRead = document.getElementById('ayahRead');
    const ayahTranslation = document.getElementById('ayahTranslation');
    const ayahAudio = document.getElementById('ayahAudio');

    // Dua Elements
    const duaHeader = document.getElementById('duaHeader');
    const duaArab = document.getElementById('duaArab');
    const duaLatin = document.getElementById('duaLatin');
    const duaTranslation = document.getElementById('duaTranslation');

    // --- State ---
    let cities = [];
    let detectedCoords = null;
    let countdownInterval = null;

    // Embedded Dua List (Static & Reliable)
    const duas = [
        { title: "Doa Sebelum Tidur", arab: "بِسْمِكَ اللّهُمَّ اَحْيَا وَ بِسْمِكَ اَمُوْتُ", latin: "Bismika Allahumma ahya wa bismika amut", trans: "Dengan nama-Mu Ya Allah aku hidup, dan dengan nama-Mu aku mati" },
        { title: "Doa Bangun Tidur", arab: "اَلْحَمْدُ ِللهِ الَّذِىْ اَحْيَانَا بَعْدَمَآ اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ", latin: "Alhamdulillahil ladzi ahyana ba'da ma amatana wailaihin nusyur", trans: "Segala puji bagi Allah yang telah menghidupkan kami sesudah kami mati (membangunkan dari tidur) dan hanya kepada-Nya kami dikembalikan" },
        { title: "Doa Sebelum Makan", arab: "اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", latin: "Allahumma barik lana fima razaqtana waqina 'adzaban nar", trans: "Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka" },
        { title: "Doa Sesudah Makan", arab: "اَلْحَمْدُ ِللهِ الَّذِىْ اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ", latin: "Alhamdulillahil ladzi ath-amana wa saqana waja'alana muslimin", trans: "Segala puji bagi Allah yang telah memberi makan kami dan minuman kami, serta menjadikan kami sebagai orang-orang islam" },
        { title: "Doa Masuk Masjid", arab: "اَللّٰهُمَّ افْتَحْ لِيْ اَبْوَابَ رَحْمَتِكَ", latin: "Allahummaf tahlii abwaaba rahmatik", trans: "Ya Allah, bukalah untukku pintu-pintu rahmat-Mu" },
        { title: "Doa Keluar Masjid", arab: "اَللّٰهُمَّ اِنِّى اَسْأَلُكَ مِنْ فَضْلِكَ", latin: "Allahumma inni as-aluka min fadhlika", trans: "Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu" },
        { title: "Doa Kedua Orang Tua", arab: "رَبِّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا", latin: "Rabbighfir li, wa li walidayya, warham huma kama rabbayani shaghira", trans: "Tuhanku, ampunilah dosaku dan (dosa) kedua orang tuaku. Sayangilah keduanya sebagaimana keduanya menyayangiku di waktu aku kecil" },
        { title: "Doa Sapu Jagat", arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", latin: "Rabbana atina fid dunya hasanah wa fil akhirati hasanah waqina 'adzaban nar", trans: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka" }
    ];

    // Default values
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
    let selectedCity = 'jakartapusat';

    // --- Theme Init ---
    let currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme);

    // --- Init ---
    init();

    async function init() {
        await loadCities();

        // Modified: Always try to detect location on reload, ignoring localStorage for initialization
        // We only use localStorage to save the user's preference for the CURRENT session if they change it,
        // but the user requested: "always set back to the user location, everytime user reloads"

        try {
            const locationData = await detectUserLocation();
            if (locationData && locationData.type === 'coords') {
                detectedCoords = locationData;
                selectedCity = 'detected';

                // Add Detected Option
                const option = document.createElement('option');
                option.value = 'detected';
                option.textContent = `Lokasi Terdeteksi (${locationData.city})`;
                citySelect.insertBefore(option, citySelect.children[1]); // Insert after placeholder

                localStorage.setItem('selectedCity', selectedCity);
            }
        } catch (e) {
            console.log("Auto-detection failed:", e);
        }

        // Set dropdown value
        citySelect.value = selectedCity;

        loadPrayerTimes(selectedCity, today);
        loadRandomAyah();
        loadRandomDua();

        console.log("Data provided by:");
        console.log("- Aladhan API (Prayer Times, Hijri Date)");
        console.log("- Al Quran Cloud (Ayah)");
        console.log("- ipapi.co (Location)");
    }


    // --- Event Listeners ---
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        selectedCity = citySelect.value;
        localStorage.setItem('selectedCity', selectedCity); // Save preference
        const selectedDate = new Date(dateInput.value);
        loadPrayerTimes(selectedCity, selectedDate);
    });

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    // --- Functions ---

    function setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (theme === 'dark') {
            themeIcon.classList.remove('bi-moon-fill');
            themeIcon.classList.add('bi-sun-fill');
        } else {
            themeIcon.classList.remove('bi-sun-fill');
            themeIcon.classList.add('bi-moon-fill');
        }
    }

    // Auto-detect location

    async function detectUserLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            // if (!response.ok) throw new Error('IP API failed'); 
            const data = await response.json();

            // console.log("Detected IP data:", data); // Removed for privacy
            console.log("Location data provided by ipapi.co"); // API Credits

            if (data.latitude && data.longitude) {
                return {
                    type: 'coords',
                    lat: data.latitude,
                    lon: data.longitude,
                    city: data.city || 'Detected Location'
                };
            }

            return null;
        } catch (error) {
            console.error('Location detection error:', error);
            return null;
        }
    }

    // 1. Load Cities
    async function loadCities() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/kota.json');
            cities = await response.json();

            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = formatCityName(city);
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }

    // 2. Load Prayer Times (Aladhan API)
    async function loadPrayerTimes(cityId, date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        let url = '';
        let displayName = '';

        if (cityId === 'detected' && detectedCoords) {
            url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${detectedCoords.lat}&longitude=${detectedCoords.lon}&method=20&tune=2,2,-2,2,2,2,2,2`;
            displayName = detectedCoords.city;
        } else {
            const formattedCity = formatCityName(cityId);
            displayName = formattedCity;
            url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(formattedCity)}&country=Indonesia&method=20&tune=2,2,-2,2,2,2,2,2`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const dataWrapper = await response.json();
            const data = dataWrapper.data;

            // Aladhan API returns date in "DD-MM-YYYY" string in timings.date.gregorian.date
            const targetDay = String(date.getDate()).padStart(2, '0');
            const todayDataObj = data.find(item => item.date.gregorian.day === targetDay);

            // Render Header Basics
            headerCity.textContent = `Jadwal Sholat ${displayName}`;
            headerMonth.textContent = `Jadwal Sholat Bulan ${date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

            let dateDisplay = formatDate(date);

            if (todayDataObj) {
                // Get Hijri Date
                const hijri = todayDataObj.date.hijri;
                // Fix for mobile wrapping: Break on mobile, Slash on desktop
                dateDisplay += `<span class="d-md-none"><br></span><span class="d-none d-md-inline"> / </span>${hijri.day} ${hijri.month.en} ${hijri.year} H`;
                renderSingleGrid(todayDataObj, date);
            } else {
                singleDayGrid.innerHTML = '<div class="col-12 text-center">Data tidak ditemukan untuk tanggal ini.</div>';
                if (countdownInterval) clearInterval(countdownInterval);
                document.getElementById('countdownContainer').classList.add('d-none');
            }

            headerDate.innerHTML = dateDisplay; // Use innerHTML to render distinct spans

            // Render Monthly
            renderMonthlyRows(data);

        } catch (error) {
            console.error('Error loading prayer times:', error);
            singleDayGrid.innerHTML = '<div class="col-12 text-center text-danger">Gagal memuat data (API Error).</div>';
        }
    }

    function renderSingleGrid(item, viewDate) {
        const t = item.timings;
        // Times format: "05:00 (WIB)". We want just "05:00".
        const clean = (timeStr) => timeStr.split(' ')[0];
        const dhuha = calculateDhuha(clean(t.Sunrise), viewDate);

        const times = [
            { name: 'Imsak', time: clean(t.Imsak) },
            { name: 'Shubuh', time: clean(t.Fajr) },
            { name: 'Terbit', time: clean(t.Sunrise) },
            { name: 'Dhuha', time: dhuha },
            { name: 'Dzuhur', time: clean(t.Dhuhr) },
            { name: 'Ashar', time: clean(t.Asr) },
            { name: 'Maghrib', time: clean(t.Maghrib) },
            { name: 'Isya', time: clean(t.Isha) }
        ];

        let html = '';
        times.forEach(timeObj => {
            html += `
                <div class="col-6 col-sm-4 col-md-3 col-lg-auto mb-2" style="min-width: 100px;">
                    <div class="card h-100 border-0 shadow-sm bg-body-tertiary">
                        <div class="card-body p-2 text-center">
                            <small class="text-uppercase text-muted fw-bold d-block mb-1" style="font-size: 0.75rem;">${timeObj.name}</small>
                            <span class="h5 mb-0 fw-bold text-body">${timeObj.time}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        singleDayGrid.innerHTML = html;
        startCountdown(times, viewDate);
    }

    function startCountdown(times, viewDate) {
        if (countdownInterval) clearInterval(countdownInterval);

        // Hide if the selected view date is not today in local time
        const now = new Date();
        const isToday = viewDate.getDate() === now.getDate() &&
            viewDate.getMonth() === now.getMonth() &&
            viewDate.getFullYear() === now.getFullYear();

        // If user is looking at a different date, we shouldn't show a live countdown to that date's prayer times
        if (!isToday) {
            countdownContainer.classList.add('d-none');
            return;
        }

        countdownContainer.classList.remove('d-none');

        function updateCountdown() {
            const currentTime = new Date();
            let nextPrayer = null;
            let nextPrayerDate = null;

            for (const timeObj of times) {
                if (timeObj.time === '-') continue;
                const [h, m] = timeObj.time.split(':').map(Number);
                const prayerDate = new Date(viewDate.getTime());
                prayerDate.setHours(h, m, 0, 0);

                if (prayerDate > currentTime) {
                    nextPrayer = timeObj.name;
                    nextPrayerDate = prayerDate;
                    break;
                }
            }

            if (!nextPrayer) {
                // All prayers for today have passed
                nextPrayerTimeElem.textContent = "-";
                nextPrayerNameElem.textContent = "Esok Hari";
                return;
            }

            nextPrayerNameElem.textContent = nextPrayer;

            const diffMs = nextPrayerDate - currentTime;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            const hStr = String(diffHours).padStart(2, '0');
            const mStr = String(diffMinutes).padStart(2, '0');
            const sStr = String(diffSeconds).padStart(2, '0');

            if (diffHours > 0) {
                nextPrayerTimeElem.textContent = `- ${hStr}:${mStr}:${sStr}`;
            } else {
                nextPrayerTimeElem.textContent = `- ${mStr}:${sStr}`;
            }
        }

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function renderMonthlyRows(data) {
        monthlyRows.innerHTML = '';
        const today = new Date();
        const todayDay = String(today.getDate()).padStart(2, '0');
        const todayMonth = today.getMonth() + 1;
        const todayYear = String(today.getFullYear());

        data.forEach(item => {
            const tr = document.createElement('tr');

            // Highlight ONLY if it matches today's date (Day, Month, Year)
            const isToday = (item.date.gregorian.day === todayDay) &&
                (Number(item.date.gregorian.month.number) === todayMonth) &&
                (item.date.gregorian.year === todayYear);

            if (isToday) {
                tr.classList.add('table-primary');
            }

            const dateStr = item.date.gregorian.day + ' ' + item.date.gregorian.month.en.substr(0, 3);
            const dateObj = new Date(item.date.gregorian.year, item.date.gregorian.month.number - 1, item.date.gregorian.day);
            const t = item.timings;
            const clean = (timeStr) => timeStr.split(' ')[0];
            const dhuha = calculateDhuha(clean(t.Sunrise), dateObj);

            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${clean(t.Imsak)}</td>
                <td>${clean(t.Fajr)}</td>
                <td>${clean(t.Sunrise)}</td>
                <td>${dhuha}</td>
                <td>${clean(t.Dhuhr)}</td>
                <td>${clean(t.Asr)}</td>
                <td>${clean(t.Maghrib)}</td>
                <td>${clean(t.Isha)}</td>
            `;
            monthlyRows.appendChild(tr);
        });
    }

    // 3. Load Random Ayah (Al Quran Cloud - Single Endpoint)
    async function loadRandomAyah() {
        try {
            // Step 1: Get random Surah info
            if (!window.surahList) {
                const sResp = await fetch('https://api.alquran.cloud/v1/surah');
                const sData = await sResp.json();
                window.surahList = sData.data;
            }

            const randomSurah = window.surahList[Math.floor(Math.random() * 114)];
            const randomAyahNum = Math.floor(Math.random() * randomSurah.numberOfAyahs) + 1;

            // Step 2: Fetch Ayah with Editions
            // quran-uthmani (Arabic), id.indonesian (Translation), ar.alafasy (Audio)
            const url = `https://api.alquran.cloud/v1/ayah/${randomSurah.number}:${randomAyahNum}/editions/quran-uthmani,id.indonesian,ar.alafasy`;

            const response = await fetch(url);
            const dataWrapper = await response.json();
            const data = dataWrapper.data; // Array of 3 editions

            const arabic = data.find(e => e.edition.identifier === 'quran-uthmani');
            const translation = data.find(e => e.edition.identifier === 'id.indonesian');
            const audio = data.find(e => e.edition.identifier === 'ar.alafasy');

            ayahHeader.textContent = `${randomSurah.englishName} (${randomSurah.name}) Ayat ${randomAyahNum}`;
            ayahArab.textContent = arabic.text;
            ayahRead.textContent = "";
            ayahTranslation.textContent = `"${translation.text}"`;
            ayahAudio.src = audio.audio;

            ayahAudio.onerror = () => { console.error("Audio error"); };

        } catch (error) {
            console.error('Error loading ayah:', error);
            ayahHeader.textContent = 'Gagal memuat ayat.';
        }
    }

    // 4. Load Random Dua (Local Data)
    function loadRandomDua() {
        try {
            const randomDua = duas[Math.floor(Math.random() * duas.length)];

            duaHeader.textContent = randomDua.title;
            duaArab.textContent = randomDua.arab;
            duaLatin.textContent = randomDua.latin;
            duaTranslation.textContent = randomDua.trans;

        } catch (error) {
            console.error('Error loading dua:', error);
            duaHeader.textContent = 'Gagal memuat doa.';
        }
    }

    // Helpers
    function calculateDhuha(sunriseTime, baseDate = new Date()) {
        if (!sunriseTime) return '-';
        const [hours, minutes] = sunriseTime.split(':').map(Number);
        const date = new Date(baseDate.getTime());
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + 20); // Dhuha ~20 mins after sunrise

        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    function formatCityName(str) {
        const lower = str.toLowerCase();

        // Map of specific overrides for complex names that regex might miss or misformat
        const overrides = {
            'acehbaratdaya': 'Aceh Barat Daya',
            'acehbarat': 'Aceh Barat',
            'acehbesar': 'Aceh Besar',
            'acehjaya': 'Aceh Jaya',
            'acehselatan': 'Aceh Selatan',
            'acehsingkil': 'Aceh Singkil',
            'acehtamiang': 'Aceh Tamiang',
            'acehtengah': 'Aceh Tengah',
            'acehtenggara': 'Aceh Tenggara',
            'acehtimur': 'Aceh Timur',
            'acehutara': 'Aceh Utara',
            // -- 
            'bandarlampung': 'Bandar Lampung',
            'pangkalpinang': 'Pangkal Pinang',
            'tanjungpinang': 'Tanjung Pinang',
            'tanjungbalai': 'Tanjung Balai',
            'tebingtinggi': 'Tebing Tinggi',
            'bukittinggi': 'Bukit Tinggi',
            'lubuklinggau': 'Lubuk Linggau',
            'padangpanjang': 'Padang Panjang',
            'padangsidempuan': 'Padang Sidempuan',
            'pematangsiantar': 'Pematang Siantar',
            'payakumbuh': 'Payakumbuh',
            'sawahlunto': 'Sawahlunto',
            'solok': 'Solok',
            'lhoseumawe': 'Lhokseumawe',
            'subulussalam': 'Subulussalam',
            'gunungsitoli': 'Gunungsitoli',
            'kotamobagu': 'Kotamobagu',
            'tidorekepulauan': 'Tidore Kepulauan',
            'tomohon': 'Tomohon',
            'baubau': 'Baubau',
            'parepare': 'Parepare',
            // --
            'jakartabarat': 'Jakarta Barat',
            'jakartapusat': 'Jakarta Pusat',
            'jakartaselatan': 'Jakarta Selatan',
            'jakartatimur': 'Jakarta Timur',
            'jakartautara': 'Jakarta Utara',
            // --
            'kepulauansribu': 'Kepulauan Seribu',
            'kepseribu': 'Kepulauan Seribu',
            // --
            'kabtimortengahselatan': 'Kabupaten Timor Tengah Selatan',
            'kepsiautagulandangbiaro': 'Kepulauan Siau Tagulandang Biaro',
            'alor': 'Alor',
            'argamakmur': 'Arga Makmur'
        };

        if (overrides[lower]) {
            return overrides[lower];
        }

        // Generic splitters for common Indonesian city patterns
        // 1. Split common prefixes
        let formatted = str.replace(/^(bandar|bukit|gunung|kota|kabupaten|pulau|tanjung|lubuk|padang|pematang|sungai|kuala|muara|rantau|tanah|ujung|kepulauan|bolaang)(.+)/i, '$1 $2');

        // 2. Split common suffixes (if not already split by prefix rule)
        formatted = formatted.replace(/(.+)(pusat|barat|timur|selatan|utara|tengah|kota|kab|kepulauan|jaya|besar|agung|karta|pura|tani|batu|kuala|hulu|hilir|siapiapi|dalam|luar|baru|lama|lor|kidul|wetan|kulon)$/i, '$1 $2');

        // 3. Special handling for joined words that need splitting but assume single word structure
        // This is tricky without a dictionary, but we can try some common ones

        formatted = formatted.replace(/\s+/g, ' ').trim();

        return titleize(formatted);
    }

    function titleize(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    function formatDate(date) {
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
});
