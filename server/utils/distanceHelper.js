// server/utils/distanceHelper.js

function haversineDistance(coords1, coords2) {
    function toRad(x) { return x * Math.PI / 180; }

    if (!coords1 || !coords2 || !coords1.lat || !coords1.lon || !coords2.lat || !coords2.lon) {
        return Infinity;
    }

    const R = 6371; // किलोमीटर में पृथ्वी की त्रिज्या
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // मीटर में
}

module.exports = { haversineDistance };