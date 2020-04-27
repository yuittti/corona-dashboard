import {
    ACTION_PREFIXES,
    LOAD_COUNTRIES
} from '../constants/actions';

const initialState = {
    list: []
};

const countries = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case LOAD_COUNTRIES + ACTION_PREFIXES.SUCCESS:
            return {
                ...initialState,
                list: payload.countries
            };
        default:
            return state;
    };
};

export default countries;
