import React, { useEffect, useState } from 'react';
import MapBox from '../MapBox';
import CountryList from '../CountryList';
import classes from './App.module.scss';

const App = (props) => {
    useEffect(() => {
        props.fetchAllCountries();
    }, []);

    return (
        <div className={classes.container}>
            <div className={classes.leftSidebar}>
                <CountryList countries={props.countries} />
            </div>
            <div className={classes.centerContent}>
                <MapBox countries={props.countries} />
            </div>
        </div>
    );
};

export default App;
