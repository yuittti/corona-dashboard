import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from "mapbox-gl";
import { mapboxToken } from '../../tokens';
import classes from './App.module.scss';
import { countryCodes } from '../../helpers/countryCodes';
import { filterDuplicatesByKey } from '../../helpers/filters';

mapboxgl.accessToken = mapboxToken;

const App = () => {
    const mapboxElement = useRef(null);
    const [countries, setCountries] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    // const [selectedCountry, setSelectedCountry] = useState(null);
    // const mapLayers = useRef(null);
    // const mapPopup = useRef(null);
    const hoveredCountry = useRef(null);
    const vC = {
        0: '639c63',
        1: 'f8b369',
        1000: 'ed9658',
        5000: 'e27847',
        10000: 'd75a35',
        50000: 'cc3c24',
        100000: 'b60303',
        500000: '8f031c'
    };

    const getGeoByIp = async () => {
        return await fetch('http://ip-api.com/json')
            .then(resp => resp.json())
            .then(resp => {
                console.log(resp);
                return resp.countryCode
            });
    }

    // const getGeo = async () => {
    //     // const geo = [];

    //     if ("geolocation" in navigator) {
    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 if (position && position.coords) {
    //                     return {
    //                         lat: position.coords.latitude,
    //                         lon: position.coords.longitude
    //                     };
    //                 }
    //             },
    //             (error) => {
    //                 if (error) {
    //                     getGeoByIp().then(resp => {
    //                         return {
    //                             lat: resp[0],
    //                             lon: resp[1]
    //                         };
    //                     });
    //                 }
    //             }
    //         );
    //     } else {
    //         getGeoByIp().then(resp => {
    //             return {
    //                 lat: resp[0],
    //                 lon: resp[1]
    //             };
    //         });
    //     }
    // };

    // useEffect(() => {
    //     fetch('https://api.thevirustracker.com/free-api?countryTotals=ALL')
    //         .then(resp => resp.json())
    //         .then(resp => {
    //             const { countryitems = [] } = resp;
    //             if (countryitems.length && countryitems[0].stat === 'ok') {
    //                 const countryIdx = Object.keys(countryitems[0]);
    //                 const countryArr = countryIdx.reduce((list,countryId) => {
    //                     if (countryId !== 'stat'
    //                         && countryCodes[countryitems[0][countryId].code]
    //                     ) {
    //                         list.push({
    //                             ...countryitems[0][countryId],
    //                             'ISO_A3': countryCodes[countryitems[0][countryId].code]
    //                         });
    //                     }
    //                     return list;
    //                 }, []);
    //                 setCountries(filterDuplicatesByKey(countryArr, 'ISO_A3'));
    //             }
    //         })
    //         .catch(error => console.log(error));
    // }, []);

    useEffect(() => {
        // getGeo();
        fetch('https://corona.lmao.ninja/v2/countries')
            .then(resp => resp.json())
            .then(countries => {
                if (!countries.length) {
                    return;
                }
                const countryList = [];
                for (let countryCode in countryCodes) {
                    const countryFromApi = countries.find(c => c.countryInfo.iso2 === countryCode);
                    countryList.push({
                        ...countryFromApi,
                        ISO_A3: countryCodes[countryCode],
                        cases: countryFromApi ? countryFromApi.cases : 0,
                        deaths: countryFromApi ? countryFromApi.deaths : 0,
                        recovered: countryFromApi ? countryFromApi.recovered : 0,
                    });
                }
                setCountries(countryList);
            });
    }, [])

    const getGeo = async () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (position && position.coords) {
                        return {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        };
                    }
                },
                async (error) => {
                    if (error) {
                        return await getGeoByIp();
                    }
                }
            );
        } else {
            getGeoByIp().then(resp => {
                return [...resp];
            });
        }
    };

    useEffect(() => {
        if (!countries.length) {
            return;
        }

        let map;
        getGeoByIp().then(resp => {
            const country1 = countries.find(country => (country.countryInfo || {}).iso2 === resp);
            map = new mapboxgl.Map({
                container: mapboxElement.current,
                style: 'mapbox://styles/yuittti/ck91e615p13x61itjj0wlppjn',
                center: [country1.countryInfo.long, country1.countryInfo.lat],
                zoom: 3,
                minZoom: 2,
                maxZoom: 5,
            });
            map.addControl(new mapboxgl.NavigationControl());
            map.on('load', function () {
                map.addSource('countries', {
                    type: 'vector',
                    url: 'mapbox://yuittti.36vzllug',
                });
    
                var expression = ['match', ['get', 'ISO_A3']];
                var outlineExpression = ['match', ['get', 'ISO_A3']];
                countries.forEach((row) => {
                    const colors = Object.keys(vC);
                    const value = colors.find((col, idx, arr) => {
                        return row['cases'] >= col
                            && (idx+1 === arr.length || row['cases'] < arr[idx+1])
                    });
                    const color = `#${vC[value]}`;
                    expression.push(row.ISO_A3, color);
                    outlineExpression.push(row.ISO_A3, '#000');
                });
                expression.push('rgba(0,0,0,0)');
                outlineExpression.push('rgba(0,0,0,0)');
                // console.log(expression);
                map.addLayer({
                    'id': 'maine',
                    'type': 'fill',
                    'layout': {},
                    'paint': {
                        'fill-outline-color': outlineExpression,
                        'fill-color': expression,
                        'fill-opacity': 1,
                    },
                    "source": "countries",
                    "source-layer": "countries-0ortkb",
                }, 'waterway-label');
    
                map.addLayer({
                    id: 'borders',
                    source: 'countries',
                    "source-layer": "countries-0ortkb",
                    'type': 'line',
                    'paint': {
                        'line-width': 0,
                        'line-color': 'rgba(0,0,0,0)',
                        'line-blur': 0
                    },
                }, 'waterway-label');
    
                const popupOptions = {
                    closeButton: false,
                    className: `${classes.mapTooltip}`
                };
    
                const mapPopup = new mapboxgl.Popup(popupOptions);
    
                map.on('mousemove', 'maine', function(e) {
                    console.log(e.features[0]);
                    map.getCanvas().style.cursor = 'pointer';
                    if (!e.features ||
                        !e.features.length ||
                        !e.features[0].properties ||
                        !e.features[0].properties.ISO_A3 ||
                        e.features[0].properties.ISO_A3 === hoveredCountry.current
                    ) {
                        return;
                    }
                    
                    if (mapPopup) {
                        mapPopup.remove();
                    }
                    hoveredCountry.current = e.features[0].properties.ISO_A3;
    
                    var expression = ['match', ['get', 'ISO_A3']];
                    var expression1 = ['match', ['get', 'ISO_A3']];
                    var expression2 = ['match', ['get', 'ISO_A3']];
                    countries.forEach((row) => {
                        if (row.ISO_A3 === e.features[0].properties.ISO_A3) {
                            expression.push(row.ISO_A3, 3);
                            expression1.push(row.ISO_A3, '#eee');
                            expression2.push(row.ISO_A3, 1);
                        } else {
                            expression.push(row.ISO_A3, 0);
                            expression1.push(row.ISO_A3, 'black');
                            expression2.push(row.ISO_A3, 0);
                        }
                    });
                    expression.push(0);
                    expression1.push('rgba(0,0,0,0)');
                    expression2.push(0);
    
                    map.setPaintProperty('borders', 'line-width', expression);
                    map.setPaintProperty('borders', 'line-color', expression1);
                    map.setPaintProperty('borders', 'line-blur', expression2);
    
                    const countryId = e.features[0].properties.ISO_A3;
                    const selectedCountry1 = countries.find(country => countryId === country.ISO_A3) || {
                        country: e.features[0].properties.ADMIN,
                        cases: 'N/A',
                        deaths: 'N/A',
                        recovered: 'N/A'
                    };
                    
                    const titleStyles = `
                        font-size: 15px;
                        font-weight: 500;
                        margin-bottom: 3px;
                    `;
    
                    const htmlContent = `
                        <div style='${titleStyles}'>
                            ${selectedCountry1.country || e.features[0].properties.ADMIN}
                        </div>
                        <div style='color: #623801;'>
                            Total cases: ${selectedCountry1.cases.toLocaleString()}
                        </div>
                        <div style='color: #cb1212;'>
                            Deaths: ${selectedCountry1.deaths.toLocaleString()}
                        </div>
                        <div style='color: #277f26;'>
                            Recovered: ${selectedCountry1.recovered.toLocaleString()}
                        </div>
                    `;
    
                    mapPopup
                        .setLngLat(e.lngLat)
                        .setHTML(htmlContent)
                        .addTo(map);
                });
    
                map.on('mouseleave', 'maine', function(e) {
                    map.getCanvas().style.cursor = '';
                    map.setPaintProperty('borders', 'line-width', 0);
                    map.setPaintProperty('borders', 'line-color', 'rgba(0,0,0,0)');
                    map.setPaintProperty('borders', 'line-blur', 0);
                    if (mapPopup) {
                        mapPopup.remove();
                    }
                    hoveredCountry.current = null;
                    // setSelectedCountry(null);
                });
            });
        });
    }, [countries]);

    const renderMapLegend = () => {
        const getValue = (value, idx, arr) => {
            if (idx === 0) {
                return value;
            } else if (idx === arr.length - 1) {
                return `> ${Number(value).toLocaleString()}`;
            } else {
                return `${Number(value).toLocaleString()} - ${Number(arr[idx + 1]).toLocaleString()}`;
            }
        };
        return (
            <div className={classes.mapLegend}>
                {Object.keys(vC).map((value, idx, arr) => {
                    return (
                        <div className={classes.mapLegendItem}>
                            <div
                                className={classes.mapLegendColor}
                                style={{
                                    backgroundColor: `#${vC[value]}`
                                }}
                            />
                            <div className={classes.mapLegendValue}>
                                {getValue(value, idx, arr)}
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    return (
        <div>
            <div className={classes.mapContainer}>
                <div className={classes.mapBox} ref={ mapboxElement }></div>
                {renderMapLegend()}
            </div>
            
        </div>
    );
};

export default App;
