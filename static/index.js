const endpoints = {
    weather: {
        baseUrl: 'https://api.openweathermap.org/data/2.5/forecast',
        apiKey: '4f944c0231428c0ac6ebf79e36eba04d'
    },
};
$('.searchIcon').click(function() {
    const userChoice = $('.search-input').val();
    if (userChoice !== '') {
        console.log('search Success')
        countryChoice = userChoice;
        fetchWeatherData(countryChoice);
    }
});
function fetchWeatherData(latitude,longitude) {
    const weatherURL = `${endpoints.weather.baseUrl}?&lat=${latitude}&lon=${longitude}&appid=${endpoints.weather.apiKey}&units=metric&`;
    fetch(weatherURL)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            weatherData(data);
        })
        .catch((error) => {
            console.log("Error:", error);
        });
}
let humidityArray,tempArray,rainArray,pressureArray,sstartDate;
const weatherData = (data) => {
    const listOfWeatherData = data.list;
    sstartDate=data.list[0].dt_txt
    var startDate = fixDateInterval(data.list[0].dt_txt);
    humidityArray = [];
    tempArray = [];
    const tempMaxArray = [];
    rainArray=[];
    const tempMinArray = [];
    const windArray = [];
    pressureArray = [];
    const iconArray = [];
    const xAxis = data.city.coord.lat;
    const yAxis = data.city.coord.lon;
    for (const item of listOfWeatherData) {
        const temp = item.main.temp;
        const humidity = item.main.humidity;
        const wind = item.wind.speed;
        const icons = item.weather[0].icon;
        const maxTemp = item.main.temp_max;
        const minTemp = item.main.temp_min;
        const pressure = item.main.pressure;
        humidityArray.push(humidity);
        tempArray.push(temp);
        tempMaxArray.push(maxTemp);
        tempMinArray.push(minTemp);
        windArray.push(wind);
        pressureArray.push(pressure);
        iconArray.push(icons);
        rainArray.push(item.main.temp_kf)
    }
    createWeatherList(iconArray, tempArray, humidityArray, windArray, startDate, data)
    createHumidityChart(humidityArray, startDate);
    createPressureChart(pressureArray, startDate);
    createRainChart(rainArray,startDate)
    createTempChart(tempArray, startDate);
    createOverAllChart(tempArray, pressureArray, humidityArray,rainArray, startDate);
};



const createHumidityChart = (allDataValues, date) => {
    chartCreator("humidity", "spline", "Average Weekly Humidity", " ", "datetime", "Wind speed (m/s)", "%", 3, date, "humidity", allDataValues);
};

const createPressureChart = (allDataValues, date) => {
    chartCreator("pressure", "areaspline", "Average Weekly pressure", " ", "datetime", "pressure hPa", "hPa", 3, date, "pressure", allDataValues, '#800000');
};
const createRainChart = (allDataValues, date) => {
    chartCreator("rain", "areaspline", "Average Weekly Rain", " ", "datetime", "Rain", "", 3, date, "Rain", allDataValues, '#8f0000');
};
const createTempChart = (allDataValues, date) => {
    chartCreator("temprature", "areaspline", "Average Weekly Temprature", " ", "datetime", "Temprature °C", "°C", 3, date, "Temprature", allDataValues, '#A01E5F');
}

const createOverAllChart = (tempArray, pressureArray, humidityArray,rainArray, date) => {
    chartCreator("overViewAll", "spline", "Weekly OverView", "", "datetime", "Over All Chart", "", 3, date, "Temprature", tempArray, '', 'Pressure', pressureArray, 'Humidity', humidityArray,'RAIN',rainArray);
};

let mymap;
const createMap = (xAxis, yAxis) => {
    if (mymap) {
        mymap.remove();
    }
    mymap = L.map($('.weatherMap')[0]).setView([xAxis, yAxis], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(mymap);
}
const createWeatherList = (iconArray, tempArray, humidityArray, windArray, startDate, data) => {
    const listOfWeatherData = data.list;
    const flag = data.city.country.toLowerCase();
    $('.countryIcon').html(`<img src="http://openweathermap.org/images/flags/${flag}.png">`)
    $('.countryName').text(data.city.country);
    $('.cityName').text(data.city.name);
    $('.temp').text(tempArray[0]);
    $('.Humidity').text(humidityArray[0] + "%");
    $('.windSpeed').text(windArray[0].toFixed(1) + " Km/h");
    let WeatherDailyList = $('.WeatherDailyList');

    for (let i = 0; i < listOfWeatherData.length; i++) {
        let lists = listOfWeatherData[i];
        let weatherList = $('<div>').addClass('weatherList');
        let date = lists.dt_txt;
        date = date.split(" ")[1].split(":")[0];

        let dateSpan = $('<span>').addClass("dateSpan").text(date);
        let weatherIcon = $('<span>').html(`<img src="https://openweathermap.org/img/wn/${iconArray[i]}@2x.png" alt='${iconArray[i]}'>`)
            .addClass('weatherIcon');
        let tempSpan = $('<span>').addClass("tempSpan").text(tempArray[i].toFixed(1));

        weatherList.append(dateSpan, weatherIcon, tempSpan);
        WeatherDailyList.append(weatherList);
    }
}
const chartCreator = (where, type, titleText, subtitleText, xType, Ytitle, tooltip, pointInterval, pointIntervalStart, seriesName, seriesData, color, seriesName2, seriesData2, seriesName3, seriesData3, seriesName4, seriesData4) => {
    Highcharts.chart(where, {
        chart: {
            type: type,
            scrollablePlotArea: {
                minWidth: 400,
                scrollPositionX: 1
            },
            backgroundColor: '#0d121c',
            borderRadius: 15
        },
        title: {
            text: titleText,
            align: 'left',
            style: {
                color: '#FFFFFF'
            }

        },
        subtitle: {
            text: subtitleText,
            align: 'left',
            style: {
                color: '#FFFFFF'
            }
        },
        xAxis: {
            type: xType,
            labels: {
                overflow: 'justify',
                style: {
                    color: '#FFFFFF'
                }
            }
        },
        yAxis: {
            title: {
                text: Ytitle,
            },
            labels: {
                style: {
                    color: '#FFFFFF'
                }
            },
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: []
        },
        tooltip: {
            valueSuffix: tooltip,
        },
        plotOptions: {
            series: {
                lineWidth: 5,
                states: {
                    hover: {
                        lineWidth: 5
                    }
                },
                marker: {
                    enabled: false
                },
                pointInterval: pointInterval * 3600000,
                pointStart: pointIntervalStart
            }
        },
        series: [{
                name: seriesName,
                data: seriesData,
                color: color
            },
            {
                name: seriesName2,
                data: seriesData2,
                color: color
            }, {
                name: seriesName3,
                data: seriesData3,
                color: color
            },
            {
                name: seriesName4,
                data: seriesData4,
                color: color
            }
        ],
        navigation: {
            menuItemStyle: {
                fontSize: '10px',
                style: {
                    background: '#0d121c',
                    color: '#FFFFFF'
                }
            }
        }
    });
};



const fixDateInterval = (date) => {
    const [datePart, timePart] = date.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, min, sec] = timePart.split(':');
    const newDateTime = Date.UTC(year, month - 1, day, hour, min, sec);
    return newDateTime;
};
const mainDate = () => {
    var currentDate = new Date();
    var monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var month = monthNames[currentDate.getMonth()];
    var day = ("0" + currentDate.getDate()).slice(-2);
    var year = currentDate.getFullYear().toString().slice(-2);
    var formattedDate = month + " " + day + ", " + year;

    $('.dateMain').text(formattedDate);
}
mainDate();

$(".container-fluid .highcharts-figure #temprature").click(async (e)=>{
    var report=$(".container-fluid .highcharts-figure #temprature").parent().parent().children('.report')
    report.show()
    report.html(await generate_report(0))
})
$(".container-fluid .highcharts-figure #humidity").click(async(e)=>{
    var report=$(".container-fluid .highcharts-figure #humidity").parent().parent().children('.report')
    report.show()
    report.html(await generate_report(1))
})

$(".container-fluid .highcharts-figure #pressure").click(async (e)=>{
    var report=$(".container-fluid .highcharts-figure #pressure").parent().parent().children('.report')
    report.show()
    report.html(await generate_report(3))
})
$(".container-fluid .highcharts-figure #rain").click(async (e)=>{
    var report=$(".container-fluid .highcharts-figure #rain").parent().parent().children('.report')
    report.show()
    report.html(await generate_report(2))
})
async function generate_report(type){
    return new Promise((resolve,reject)=>{
        var data;
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        var dateString = year + '-' + month + '-' + day;
        if(type==0) data=tempArray
        else if(type==1) data=humidityArray
        else if(type==2) data=rainArray
        else if(type==3) data=pressureArray
        $.ajax({
            url: '',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({'column':type,'maxvalue': Math.max(...data),'minvalue':Math.min(...data),'alldata':data,'mindate':sstartDate.split(' ')[0],'maxdate':dateString}),
            success: function(response) {
                resolve(response)
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    })
   
   
}