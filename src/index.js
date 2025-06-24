async function getData (place) {
    console.log('getData called with:', place);
    const response = await fetch (`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${place}?key=B9PW4AEAY8QPFK7BS9D54QCHA`, {mode: 'cors'});
    const placeData = await response.json();
    const placeDataDew = await placeData.currentConditions.dew;
    return placeData;
}

function processWeatherData(rawData) {

    const current = rawData.currentConditions;
    const today = rawData.days[0];

    return {
        location: rawData.resolvedAddress,
        temperature: current.temp,
        chanceOfRain: current.precipprob,
        uvIndex: current.uvindex,
        humidity: current.humidity,
        visibility: current.visibility,
        feelsLike: current.feelslike,
        sunrise: current.sunrise,
        sunset: current.sunset,
    }
}

async function getWeatherData(place) {
    try {
        const rawData = await getData(place);
        const processedData = processWeatherData(rawData);
        return processedData;
    } catch (error) {
        console.error('Error fetching weather: ', error);
    }
}

getWeatherData('London').then(data => {
    console.log('Proccessed data: ', data);
});
