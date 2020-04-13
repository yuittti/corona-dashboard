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

    useEffect(() => {
        fetch('https://api.thevirustracker.com/free-api?countryTotals=ALL')
            .then(resp => resp.json())
            .then(resp => {
                const { countryitems = [] } = resp;
                if (countryitems.length && countryitems[0].stat === 'ok') {
                    const countryIdx = Object.keys(countryitems[0]);
                    const countryArr = countryIdx.reduce((list,countryId) => {
                        if (countryId !== 'stat'
                            && countryCodes[countryitems[0][countryId].code]
                        ) {
                            list.push({
                                ...countryitems[0][countryId],
                                'ISO_A3': countryCodes[countryitems[0][countryId].code]
                            });
                        }
                        return list;
                    }, []);
                    setCountries(filterDuplicatesByKey(countryArr, 'ISO_A3'));
                }
            });
    }, []);

    useEffect(() => {
        if (!countries.length) {
            return;
        }
        const map = new mapboxgl.Map({
            container: mapboxElement.current,
            style: 'mapbox://styles/yuittti/ck8yjfxca18i71iqaow1sik4z',
            // style: 'mapbox://styles/mapbox/dark-v10',
            center: [16, 27], // initial geo location
            zoom: 2,
            minZoom: 2,
            maxZoom: 5
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
                    return row['total_cases'] >= col
                        && (idx+1 === arr.length || row['total_cases'] < arr[idx+1])
                });
                const color = `#${vC[value]}`;
                expression.push(row.ISO_A3, color);
                outlineExpression.push(row.ISO_A3, '#000');
            });
            expression.push('rgba(0,0,0,0)');
            outlineExpression.push('rgba(0,0,0,0)');

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

            map.on('mousemove', 'maine', function(e) {
                if (!e.features ||
                    !e.features.length ||
                    !e.features[0].properties ||
                    !e.features[0].properties.ISO_A3 ||
                    e.features[0].properties.ISO_A3 === hoveredCountry.current
                ) {
                    return;
                }
                if (map.getLayer(hoveredCountry.current)) {
                    map.removeLayer(hoveredCountry.current);
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

                map.addLayer({
                    id: e.features[0].properties.ISO_A3,
                    source: 'countries',
                    "source-layer": "countries-0ortkb",
                    'type': 'line',
                    'paint': {
                        'line-width': expression,
                        'line-color': expression1,
                        'line-blur': expression2
                    },
                    "transition": {
                        "duration": 300,
                        "delay": 0
                      }
                }, 'waterway-label');
            });

            map.on('mouseleave', 'maine', function(e) {
                if (map.getLayer(hoveredCountry.current)) {
                    map.removeLayer(hoveredCountry.current);
                }
                hoveredCountry.current = null;
            });
        });
    });

    return (
        <div>
            {Object.values(vC).map(color => <div style={{backgroundColor: `#${color}`}}>{color}</div>)}
            <div className={classes.mapContainer}>
                <div className={classes.mapBox} ref={ mapboxElement }></div>
            </div>
        </div>
    );
};

export default App;
