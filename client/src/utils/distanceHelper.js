// 🌍 Haversine Distance Function - Client Side
// दूरी मीटर में लौटाता है (Google Maps जैसे)

// 🔁 Exported for use in React components
export function haversineDistance(coords1, coords2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    // 🛑 Check for invalid inputs
    if (
        !coords1 || !coords2 ||
        typeof coords1.lat !== 'number' || typeof coords1.lon !== 'number' ||
        typeof coords2.lat !== 'number' || typeof coords2.lon !== 'number'
    ) {
        return Infinity; // मतलब location गलत है
    }

    const R = 6371; // पृथ्वी की त्रिज्या (KM)
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    return distanceKm * 1000; // मीटर में लौटाएं
}