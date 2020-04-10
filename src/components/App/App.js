import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from "mapbox-gl";
import { mapboxToken } from '../../tokens';
import classes from './App.module.scss';
import { countryCodes } from '../../helpers/countryCodes';

mapboxgl.accessToken = mapboxToken;

const App = () => {
    const mapboxElement = useRef(null);
    const [countries, setCountries] = useState([]);

    const getColor = () => {
        var color1 = 'fc6629';
        var color2 = 'e60000';
        var ratio = 1;
        var hex = function(x) {
            x = x.toString(16);
            return (x.length === 1) ? '0' + x : x;
        };
        const res = [color1];

        while (ratio > 0) {
            ratio = ratio - 0.25;
            var r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
            var g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
            var b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));
            res.push(hex(r) + hex(g) + hex(b));
        }
        return res;
    }

    useEffect(() => {
        fetch('https://api.thevirustracker.com/free-api?countryTotals=ALL')
            .then(resp => resp.json())
            .then(resp => {
                const { countryitems = [] } = resp;
                if (countryitems.length && countryitems[0].stat === 'ok') {
                    const countryIdx = Object.keys(countryitems[0]);
                    const countryArr = countryIdx.reduce((list,countryId) => {
                        console.log(countryId);
                        if (countryId !== 'stat'
                            && countryitems[0][countryId].total_cases
                            && countryCodes[countryitems[0][countryId].code]
                        ) {
                            list.push({
                                ...countryitems[0][countryId],
                                'ISO_A3': countryCodes[countryitems[0][countryId].code]
                            })
                        }
                        return list;
                    }, []);
                    console.log(countryArr);
                    setCountries(countryArr);
                }
            });
    }, []);

    useEffect(() => {
        console.log(countries.length)
        if (!countries.length) {
            return;
        }
        const map = new mapboxgl.Map({
            container: mapboxElement.current,
            // style: 'mapbox://styles/yuittti/ck8sw2j7a1ft81ilh7ntdg0v6',
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [16, 27], // initial geo location
            zoom: 2,
            minZoom: 2,
            maxZoom: 5
        });
        map.addControl(new mapboxgl.NavigationControl());

        const values = countries.map(dataItem => dataItem.total_cases);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const interval = parseInt((maxValue - minValue) / 5);
        const valueColors = {};
        const colors = getColor();
        let accum = interval;

        for (let i = 1; i < 4; i++) {
            accum = accum + interval;
            valueColors[accum] = colors[i];
        };
        valueColors[interval] = colors[0];
        valueColors[maxValue] = colors[4];

        map.on('load', function () {
            map.addSource('countries', {
                type: 'vector',
                url: 'mapbox://yuittti.36vzllug',
                data: {
                    type: "FeatureCollection",
                    features: countries
                  }
            });

            var expression = ['match', ['get', 'ISO_A3']];
            var outlineExpression = ['match', ['get', 'ISO_A3']];
            countries.forEach((row) => {
                const colors = Object.keys(valueColors);
                const value = colors.find(col => row['total_cases'] <= col);
                const color = `#${valueColors[value]}`;
                expression.push(row.ISO_A3, color);
                outlineExpression.push(row.ISO_A3, 'white');
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
        });
    }, [countries]);

    const colors = getColor();
    return (
        <div>
            {colors.map(color => <div style={{backgroundColor: `#${color}`}}>{color}</div>)}
            <div className={classes.mapContainer}>
                <div className={classes.mapBox} ref={ mapboxElement }></div>
            </div>
        </div>
    );
};

export default App;
