import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TabBarIcon, textStyles } from '../components/index';
import { HomeScreen, ExploreScreen, NotificationScreen, MenuScreen } from '../screens/index';
import { withFirebase } from '../config/Firebase';
import { Colors } from '../constants';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

function HomeTabs({ navigation }) {
    navigation.setOptions({
        headerShown: false,
    });
    return (
        <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
            <BottomTab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Welcome',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-home" />,
                }}
            />
            <BottomTab.Screen
                name="Explore"
                component={ExploreScreen}
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-search" />,
                }}
            />
            <BottomTab.Screen
                name="Notification"
                component={NotificationScreen}
                options={{
                    title: 'Notification',
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon focused={focused} name="md-notifications" />
                    ),
                }}
            />
            <BottomTab.Screen
                name="Menu"
                component={MenuScreen}
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-menu" />,
                }}
            />
        </BottomTab.Navigator>
    );
}

export default withFirebase(HomeTabs);
