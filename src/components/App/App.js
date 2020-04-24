import React, { useEffect, useState } from 'react';
import MapBox from '../MapBox';
import CountryList from '../CountryList';
import classes from './App.module.scss';
import { countryCodes } from '../../helpers/countryCodes';
// import { filterDuplicatesByKey } from '../../helpers/filters';


const App = () => {
    const [countries, setCountries] = useState([]);

    useEffect(() => {
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
    }, []);

    return (
        <div className={classes.container}>
            <div className={classes.leftSidebar}>
                <CountryList countries={countries} />
            </div>
            <div className={classes.centerContent}>
                <MapBox countries={countries} />
            </div>
            
            
        </div>
    );
};

export default App;
