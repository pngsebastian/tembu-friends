import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';

import { fetchUserData, updateProfile, listenFriendList, clearCache } from '../redux';
import HomeTabNav from './HomeTabNav';
import AuthNav from './AuthNav';
import { withFirebase } from '../helper/Firebase';
import { AppLogo } from '../components';
import { Colors } from '../constants';
import PushNotifications from '../helper/PushNotification';

const mapStateToProps = (state) => {
    return { userData: state.userData };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchUserData: () => {
            dispatch(fetchUserData());
        },
        updateToken: (uid, token) => {
            dispatch(updateProfile(uid, { expoPushToken: token }));
        },
        listenFriendList: (uid) => {
            dispatch(listenFriendList(uid));
        },
        clearCache: () => {
            dispatch(clearCache());
        },
    };
};
const RootStack = createStackNavigator();

class RootNav extends Component {
    state = {
        isUserLoading: true,
        isAssetsLoading: true,
        isUserSignedIn: false,
        timerCounting: true,

        uid: null,
    };

    async componentDidMount() {
        console.log('Starting app');
        try {
            this.props.firebase.checkUserAuth((user) => {
                console.log('onAuthStateChange', user !== null);
                if (user && user.emailVerified) {
                    if (user.uid !== this.state.uid) {
                        console.log('Email verified');
                        this.props.fetchUserData();
                        PushNotifications.registerAsync().then((token) => {
                            if (token) {
                                this.props.updateToken(user.uid, token.data);
                            }
                        });
                        this.props.listenFriendList(user.uid);
                        this.setState({
                            uid: user.uid,
                            isUserLoading: false,
                            isUserSignedIn: true,
                        });
                    }
                } else {
                    this.props.clearCache();
                    if (user && !user.emailVerified) {
                        console.log('Email not verified');
                        this.props.firebase.signOut();
                    }
                    console.log('Not Signed In');
                    this.setState({
                        uid: null,
                        isUserLoading: false,
                        isUserSignedIn: false,
                    });
                }
            });

            if (this.state.isAssetsLoading) {
                await this.loadLocalAsync().then(() => {
                    this.setState({ isAssetsLoading: false });
                });
            }

            this.timer = setTimeout(() => {
                this.setState({
                    timerCounting: false,
                });
            }, 3000);
        } catch (error) {
            console.log('Failed to start app', error);
        }
    }

    componentWillUnmount() {
        if (this.timer) this.timer = null;
    }

    async loadLocalAsync() {
        return await Promise.all([
            Asset.loadAsync([
                require('../assets/images/logo.png'),
                require('../assets/images/default/profile.png'),
                require('../assets/images/default/banner.png'),
                require('../assets/images/menu/robot-prod.png'),
                require('../assets/images/menu/SettingsIcon.png'),
                require('../assets/images/menu/QRcode.png'),
                require('../assets/images/menu/FriendsIcon.png'),

                require('../assets/images/popup/success-icon.png'),
                require('../assets/images/popup/warning-icon.png'),
                require('../assets/images/popup/invalid-icon.png'),
                require('../assets/images/popup/robot-dev.png'),

                require('../assets/images/profile/verified-icon.png'),
                require('../assets/images/profile/house-icon.png'),
                require('../assets/images/profile/job-icon.png'),
                require('../assets/images/profile/study-icon.png'),
            ]).then(() => console.log('Assets Loaded')),
            Font.loadAsync({
                'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.otf'),
                'Futura-Medium-BT': require('../assets/fonts/Futura-Medium-BT.ttf'),
            }).then(() => console.log('Font Loaded')),
        ]);
    }

    render() {
        const { isUserLoading, isAssetsLoading, isUserSignedIn, timerCounting } = this.state;
        if (timerCounting || isUserLoading || isAssetsLoading) {
            return (
                <View style={styles.container}>
                    <AppLogo style={styles.logo} />
                    <View style={styles.text}>
                        <ActivityIndicator size="small" />
                        <Text>Fetching resources...{isAssetsLoading ? '' : ' Done'}</Text>
                        <Text>Fetching user data...{isUserLoading ? '' : ' Done'}</Text>
                        {!isUserLoading &&
                            !isAssetsLoading &&
                            (isUserSignedIn ? (
                                <Text>Signing you in</Text>
                            ) : (
                                <Text>Proceed to login</Text>
                            ))}
                    </View>
                </View>
            );
        } else {
            return (
                <NavigationContainer>
                    <RootStack.Navigator>
                        {isUserSignedIn ? (
                            <RootStack.Screen name="App" component={HomeTabNav} />
                        ) : (
                            <RootStack.Screen name="Auth" component={AuthNav} />
                        )}
                    </RootStack.Navigator>
                </NavigationContainer>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appWhite,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        justifyContent: 'center',
        alignSelf: 'center',
    },
    text: {
        bottom: 5,
        alignItems: 'center',
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(RootNav));
