# Be More Moslem - Jadwal Sholat (Prayer Schedule)

A beautifully designed web application that provides accurate daily prayer times for cities across Indonesia. This app also features Hijri calendar integration, random Quranic verses with audio, and daily supplications (Dua).

## Features

- **Accurate Prayer Times**: Displays Imsyak, Shubuh, Terbit (Sunrise), Dhuha, Dzuhur, Ashr, Maghrib, and Isya timings.
- **Hijri Calendar Integration**: Shows the current Hijri date alongside the Gregorian date.
- **Automatic Location Detection**: Tries to detect your city automatically using IP Geolocation.
- **City Selection**: Choose from a wide range of cities in Indonesia via the dropdown menu.
- **Monthly Schedule**: View the prayer schedule for the entire month.
- **Daily Inspiration**:
    - **Random Ayah**: A random verse from the Quran with Arabic script, Indonesian translation, and audio recitation.
    - **Random Dua**: A daily supplication with Arabic, Latin transliteration, and meaning.
- **Responsive Design**: Built with Bootstrap 5, fully responsive for mobile and desktop.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5.2.3
- **Icons**: Bootstrap Icons
- **APIs**:
    - [Aladhan API](https://aladhan.com/prayer-times-api) (Prayer Times & Hijri Calendar)
    - [Al Quran Cloud API](https://alquran.cloud/api) (Quran Verses & Audio)
    - [ipapi.co](https://ipapi.co/) (IP Geolocation)
    - [GitHub Gist (lakuapik)](https://github.com/lakuapik/jadwalsholatorg) (City List JSON)

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/jadwal-sholat.git
   ```
2. **Open the project**:
   Simply open `index.html` in your preferred web browser. No server setup is required, as it runs entirely on the client-side.

## Usage

1. **Allow Location Access**: Upon loading, the app may request location access or use your IP to estimate your city.
2. **Select City & Date**: Use the dropdown menu to select a specific city or the date picker to check schedules for other days.
3. **Listen to Quran**: Click the play button in the "Ayat Hari Ini" section to listen to the recitation.

## License

This project is open-source and available under the MIT License.
