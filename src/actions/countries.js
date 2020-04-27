import {
    ACTION_PREFIXES,
    LOAD_COUNTRIES
} from '../constants/actions';
import { countryCodes } from '../helpers/countryCodes';

const transformCountries = (countries) => {
    const countryList = [];
    if (!countries || !countries.length) {
        return countryList;
    }
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
    return countryList;
}

export const fetchAllCountries = () => async (dispatch) => {
    dispatch({
        type: LOAD_COUNTRIES + ACTION_PREFIXES.START
    });

    fetch('https://corona.lmao.ninja/v2/countries')
        .then(resp => resp.json())
        .then(resp => dispatch({
            type: LOAD_COUNTRIES + ACTION_PREFIXES.SUCCESS,
            payload: {
                countries: transformCountries(resp)
            },
            transformCountries: true
        }))
        .catch(error => dispatch({
            type: LOAD_COUNTRIES + ACTION_PREFIXES.FAIL,
            payload: {
                error: error
            }
        }));
};
       