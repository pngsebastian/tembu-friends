import React from 'react';
import renderer from 'react-test-renderer';

import AppLogo from '../AppLogo';

describe('<AppLogo/>', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<AppLogo />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
