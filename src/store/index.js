import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';

const enhancers = [];
const devToolsExtension = () =>
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({
        serialize: true,
        trace: true
    });

if (typeof devToolsExtension() === 'function') {
    enhancers.push(devToolsExtension());
}

const middleware = [
    thunk
];

const store = createStore(
    reducers,
    compose(
        applyMiddleware(...middleware),
        ...enhancers
    )
);

window.store = store;

export default store;
