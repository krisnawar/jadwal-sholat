document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const citySelect = document.getElementById('citySelect');
    const dateInput = document.getElementById('dateInput');
    const searchForm = document.getElementById('searchForm');

    // Header Elements
    const headerCity = document.getElementById('headerCity');
    const headerDate = document.getElementById('headerDate');
    const headerMonth = document.getElementById('headerMonth');

    // Table Elements
    const singleDayRow = document.getElementById('singleDayRow');
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

    // --- Init ---
    init();

    async function init() {
        await loadCities();

        // Modified: Always try to detect location on reload, ignoring localStorage for initialization
        // We only use localStorage to save the user's preference for the CURRENT session if they change it,
        // but the user requested: "always set back to the user location, everytime user reloads"

        try {
            const detectedCity = await detectUserLocation();
            if (detectedCity) {
                selectedCity = detectedCity;
                // We update localStorage just so the 'submit' event has a baseline, 
                // but we effectively ignore the *previous* localStorage value on init now.
                localStorage.setItem('selectedCity', selectedCity);
            }
        } catch (e) {
            console.log("Auto-detection failed, using default or localStorage fallback if desired (currently default).");
        }

        // Set dropdown value
        citySelect.value = selectedCity;

        loadPrayerTimes(selectedCity, today);
        loadRandomAyah();
        loadRandomDua();
    }


    // --- Event Listeners ---
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        selectedCity = citySelect.value;
        localStorage.setItem('selectedCity', selectedCity); // Save preference
        const selectedDate = new Date(dateInput.value);
        loadPrayerTimes(selectedCity, selectedDate);
    });

    // --- Functions ---

    // Auto-detect location
    async function detectUserLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            // if (!response.ok) throw new Error('IP API failed'); // ipapi sometimes returns 429 but works on reload
            const data = await response.json();
            const city = data.city ? data.city.toLowerCase().replace(/\s/g, '') : '';
            console.log("Detected city:", city);

            // 1. Exact Match
            if (cities.includes(city)) return city;

            // 2. "Pusat" Suffix (e.g. Jakarta -> jakartapusat)
            if (cities.includes(city + 'pusat')) return city + 'pusat';

            // 3. Partial Match
            const match = cities.find(c => c.includes(city));
            if (match) return match;

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
        // Format city name for Aladhan API (jakartapusat -> Jakarta Pusat)
        const formattedCity = formatCityName(cityId);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(formattedCity)}&country=Indonesia&method=20`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const dataWrapper = await response.json();
            const data = dataWrapper.data;

            // Aladhan API returns date in "DD-MM-YYYY" string in timings.date.gregorian.date
            const targetDay = String(date.getDate()).padStart(2, '0');
            const todayDataObj = data.find(item => item.date.gregorian.day === targetDay);

            // Render Header Basics
            headerCity.textContent = `Jadwal Sholat ${formattedCity}`;
            headerMonth.textContent = `Jadwal Sholat Bulan ${date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

            let dateDisplay = formatDate(date);

            if (todayDataObj) {
                // Get Hijri Date
                const hijri = todayDataObj.date.hijri;
                dateDisplay += ` / ${hijri.day} ${hijri.month.en} ${hijri.year} H`;
                renderSingleRow(todayDataObj);
            } else {
                singleDayRow.innerHTML = '<tr><td colspan="8">Data tidak ditemukan untuk tanggal ini.</td></tr>';
            }

            headerDate.textContent = dateDisplay;

            // Render Monthly
            renderMonthlyRows(data);

        } catch (error) {
            console.error('Error loading prayer times:', error);
            singleDayRow.innerHTML = '<tr><td colspan="8">Gagal memuat data (API Error).</td></tr>';
        }
    }

    function renderSingleRow(item) {
        const t = item.timings;
        // Times format: "05:00 (WIB)". We want just "05:00".
        const clean = (timeStr) => timeStr.split(' ')[0];
        const dhuha = calculateDhuha(clean(t.Sunrise));

        singleDayRow.innerHTML = `
            <tr>
                <td>${clean(t.Imsak)}</td>
                <td>${clean(t.Fajr)}</td>
                <td>${clean(t.Sunrise)}</td>
                <td>${dhuha}</td>
                <td>${clean(t.Dhuhr)}</td>
                <td>${clean(t.Asr)}</td>
                <td>${clean(t.Maghrib)}</td>
                <td>${clean(t.Isha)}</td>
            </tr>
        `;
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
            const t = item.timings;
            const clean = (timeStr) => timeStr.split(' ')[0];
            const dhuha = calculateDhuha(clean(t.Sunrise));

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
    function calculateDhuha(sunriseTime) {
        if (!sunriseTime) return '-';
        const [hours, minutes] = sunriseTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + 20); // Dhuha ~20 mins after sunrise

        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    function formatCityName(str) {
        // "jakartapusat" -> "Jakarta Pusat"
        // Separate common suffixes
        let formatted = str.replace(/(pusat|barat|timur|selatan|utara|tengah|kota|kab|kepulauan)$/i, ' $1');
        return titleize(formatted);
    }

    function titleize(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    function formatDate(date) {
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
});
