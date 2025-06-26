import backgroundImage from './images/background.jpg';

import clearDay from './images/icons/clear-day.png';
import clearNight from './images/icons/clear-night.png';
import rainy from './images/icons/rain.png';
import snowy from './images/icons/snow.png';
import sleet from './images/icons/sleet.png';
import wind from './images/icons/wind.png';
import fog from './images/icons/fog.png';
import cloudy from './images/icons/cloudy.png';
import cloudyDay from './images/icons/partly-cloudy-day.png';
import cloudyNight from './images/icons/partly-cloudy-night.png';


import './styles.css';
document.documentElement.style.setProperty('--bg-image', `url(${backgroundImage})`);

async function getData (place) {
    console.log('getData called with:', place);
    const response = await fetch (`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${place}?key=B9PW4AEAY8QPFK7BS9D54QCHA`, {mode: 'cors'});
    
    if(!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const placeData = await response.json();
    return placeData;
}

function processWeatherData(rawData) {

    const current = rawData.currentConditions;
    const today = rawData.days[0];

    const hourly24 = today.hours.map(hour => {
        const time24 = hour.datetime;
        const hourNum = parseInt(time24.split(':')[0]);

        let displayTime
        if(hourNum === 0) displayTime = '12AM';
        else if (hourNum === 12) displayTime = '12PM';
        else if (hourNum < 12) displayTime = `${hourNum}AM`;
        else displayTime = `${hourNum - 12}PM`;

        return {
            time: displayTime,
            temperature: Math.round(hour.temp)
        };
    });

    const sixDayForecast = rawData.days.slice(0,6).map(day => {
        return {
            date: day.datetime,
            highTemp: Math.round(day.tempmax),
            lowTemp: Math.round(day.tempmin),
            icon: day.icon
        };
    });

    return {
        location: rawData.resolvedAddress,
        temperature: current.temp,
        chanceOfRain: current.precipprob,
        uvIndex: current.uvindex,
        humidity: current.humidity,
        visibility: current.visibility,
        feelsLike: current.feelslike,
        sunrise: today.sunrise,
        sunset: today.sunset,
        hourlyForecast: hourly24,
        sixDayForecast: sixDayForecast
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

function getWeatherIcon(iconCode) {

    const iconMap = {
        'clear-day': clearDay,
        'clear-night': clearNight,
        'rain': rainy,
        'snow': snowy,
        'sleet': sleet,
        'wind': wind,
        'fog': fog,
        'cloudy': cloudy,
        'partly-cloudy-day': cloudyDay,
        'partly-cloudy-night': cloudyNight,
        // 'hail': './icons/hail.png',
        // 'thunderstorm': './icons/thunderstorm.png',
        // 'tornado': './icons/tornado.png'
    };

    return iconMap[iconCode] || './icons/clear-day.png';
}

const searchContent = document.getElementById("search-content");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {

    let searchVal = searchContent.value;

    if(!searchVal) {
        console.log('enter the name of the place!');
    }

    getWeatherData(searchVal).then(data => {
        console.log('Proccessed data: ', data);
        displayData(data);
        overviewText(data);
        forecastText(data);
    });
});

const placeName = document.getElementById('place-name');
const placeTemp = document.getElementById('place-temp');
const placeRain = document.getElementById('place-rain');

const todayIcon = document.getElementById('today-icon');

const uvIndex = document.querySelector('#uv-index .bottom-data');
const humidity = document.querySelector('#humidity .bottom-data');
const visibility = document.querySelector('#visibility .bottom-data');
const feelsLike = document.querySelector('#feels-like .bottom-data');
const sunrise = document.querySelector('#sunrise .bottom-data');
const sunset = document.querySelector('#sunset .bottom-data');

function displayData(data) {

    const nameText = data.location;
    placeName.textContent = nameText;

    const tempText = data.temperature;
    placeTemp.textContent = `${tempText}°F`;

    const rainText = data.chanceOfRain;
    placeRain.textContent = `Chance of Rain: ${rainText}%`;

    const todayImage = data.sixDayForecast[0].icon;
    todayIcon.src = getWeatherIcon(todayImage);
    todayIcon.width = 105;
    todayIcon.height = 100;

    const uvText = data.uvIndex;
    uvIndex.textContent = uvText;

    const humidText = data.humidity;
    humidity.textContent = `${humidText}%`;

    const visText = data.visibility;
    visibility.textContent = `${visText} mi.`;

    const feelsText = data.feelsLike;
    feelsLike.textContent = `${feelsText}°F`;

    const riseText = data.sunrise;
    sunrise.textContent = riseText;

    const setText = data.sunset;
    sunset.textContent = setText;
}

function overviewText(data) {
    
    const overviewContainer = document.getElementById('overview-container');
    overviewContainer.innerHTML = '';
    
    
    for (let i = 0; i < 24; i++) {
        const hour = data.hourlyForecast[i];
        
        const card = document.createElement('div');
        card.className = 'overview-card';
        
        const cardTime = document.createElement('div');
        cardTime.textContent = hour.time;
        
        const cardTemp = document.createElement('div');
        cardTemp.textContent = `${hour.temperature}°F`;
        
        card.appendChild(cardTime);
        card.appendChild(cardTemp);
        
        overviewContainer.appendChild(card);
    }
}

function forecastText(data) {

    const weekCardContainer = document.getElementById('week-card-container');
    weekCardContainer.innerHTML='';

    const dayLabels = [
        'Tommorow',
        '2 days from now',
        '3 days from now',
        '4 days from now',
        '5 days from now',
    ];

    for(let i=1; i <= 5; i++) {
        const dayData = data.sixDayForecast[i];

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';

        const dayLabel = document.createElement('div');
        dayLabel.className = `day-${i}-forecast`;
        dayLabel.textContent = dayLabels[i - 1];

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-forcast';
        const img = document.createElement('img');
        img.src = getWeatherIcon(dayData.icon);
        img.alt = dayData.icon;
        img.width = 45;
        img.height = 40;
        imageContainer.appendChild(img);

        const tempDisplay = document.createElement('div');
        tempDisplay.className = 'temp-forcast';
        tempDisplay.textContent = `High/Low: ${dayData.highTemp}°/${dayData.lowTemp}°`;

        forecastCard.appendChild(dayLabel);
        forecastCard.appendChild(imageContainer);
        forecastCard.appendChild(tempDisplay);

        weekCardContainer.appendChild(forecastCard);
    }
}
