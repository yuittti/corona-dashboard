import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchAllCountries } from '../../actions/countries';
import { countriesSelector } from '../../selectors/countries';
import App from './App';

const mapStateToProps = (state) => {
    return {
        countries: countriesSelector(state)
    };
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        fetchAllCountries
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
