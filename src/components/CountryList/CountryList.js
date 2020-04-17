import React from 'react';
import classes from './CountryList.module.scss';

const CountryList = (props) => {
    const sortedCountries = props.countries.sort((a, b) => {
        return b.cases - a.cases;
    });

    return (
        <div className={classes.listWrapper}>
            <div>Country list</div>
            <ul className={classes.list}>
                {sortedCountries.map(country => {
                    return (
                        <li className={classes.item}>
                            <span className={classes.itemTitle}>{country.country}</span>
                            <span className={classes.itemValue}>{country.cases.toLocaleString()}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
};

export default CountryList;
