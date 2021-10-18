import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';

import _ from 'lodash'
import geocoder from "geocoder";
import './utils/ReactTostify.css';
import {toast} from 'react-toastify';
import {compose} from "react-apollo";
import styles from './App.module.css';
import Chat from "./components/Chat/Chat";
import {graphql} from "react-apollo/index";
import {ToastContainer} from 'react-toastify';
import Browse from "./components/Browse/Browse";
import LoginPage from "./components/LoginPage/LoginPage";
import Toolbar from "./components/Navigation/Toolbar/Toolbar";
import UserProfile from "./components/UserProfile/UserProfile";
import EditProfile from './components/EditProfile/EditProfile'
import Confirmation from "./components/Confirmation/Confirmation"
import Onboarding from "./components/Onboarding/Onboarding";
import ResetPassword from './components/ResetPassword/ResetPassword';
import {fetchGraphql} from "./utils/graphql";
import GeolocationDialog from "./components/GeolocationDialog/GeolocationDialog";
import NotificationsDrawer from "./components/NotificationsDrawer/NotificationsDrawer";

import {
	getConversationsQuery,
	getUserAgentDataQuery,
	isOnboardedQuery,
	notificationsQuery,
	usedInterestsQuery
} from "./graphql/queries";
import {
	markMessagesAsSeenMutation,
	markNotificationsAsSeenMutation,
	saveLocationMutation,
	sendMessageMutation
} from "./graphql/mutations";
import {
	chatSubscription,
	notificationSubscription
} from "./graphql/subscriptions";


class App extends Component {

	state = {
		isAuth: false,
		token: null,
		userId: null,
		isLoading: true,
		geolocationDialogOpen: false,
		newNotifications: 0,
	}

	componentDidMount() {
		console.log("COMP DID MOUNT")
		const token = localStorage.getItem('token')
		const expiryDate = localStorage.getItem('expiryDate')
		if (!token || !expiryDate) {
			return
		}
		if (new Date(expiryDate) <= new Date()) {
			this.logoutHandler()
			return
		}
		const userId = parseInt(localStorage.getItem('userId'))
		const remainingTime = new Date(expiryDate).getTime() - new Date().getTime()
		this.setState({isAuth: true, token: token, userId: userId})
		this.setAutoLogout(remainingTime)
		if (typeof this.state.isOnboarded === 'undefined') {
			this.getIsOnboarded(token)
		}
	}

	componentWillReceiveProps({data}) {
		console.log(data)
		const {trackNotification, newMessage} = data
		if (!!data && !!trackNotification) {
			const {type, senderName} = trackNotification
			const newNotifications = [trackNotification, ...this.state.notifications]
			const text = (name) => ({
				"match": `You matched with ${name}`,
				"like": `${name} liked you`,
				"unmatch": `You unmatched with ${name}`,
				"visited": `${name} visited your profile`
			})
			if (!this.state.notifications.length || !_.isEqual(this.state.notifications[0], trackNotification)) {
				this.setState({newNotifications: this.state.newNotifications + 1, notifications: newNotifications})
				toast.success(text(senderName)[type], {
					autoClose: 1300
				})
			}
		}
		else if (data && !!newMessage) {
			const rightConv = this.state.conversations.find(x => x.id === newMessage.senderId)
			if (rightConv.messages.find(x => x.timestamp === newMessage.timestamp)) {
				return
			}
			const newConv = {...rightConv, messages: [...rightConv.messages, newMessage]}
			const newConversations = this.state.conversations.map(x => x.id === newMessage.senderId ? newConv : x)
			this.setState({conversations: newConversations, unreadMessages: true})
		}
	}

	sendReply = (content, receiverId) => {
		const query = sendMessageMutation(content, receiverId)
		const cb = resData => {
			if (resData.errors) {
				throw new Error(resData.errors[0].message)
			}
			const newMessage = {
				content: content.substring(1, content.length - 1),
				receiverId: receiverId,
				senderId: this.state.userId,
				seen: true,
				timeStamp: new Date(),
				fromReply: true
			}
			const rightConv = this.state.conversations.find(x => x.id === receiverId)
			const newConv = {...rightConv, messages: [...rightConv.messages, newMessage]}
			const newConversations = this.state.conversations.map(x => x.id === receiverId ? newConv : x)
			this.setState({conversations: newConversations})
		}
		fetchGraphql(query, cb, this.state.token)
	}

	getUserAgentData = (token) => {
		console.log("GET USER DATA")
		const query = getUserAgentDataQuery
		const cb = resData => {
			if (resData.errors) {
				throw new Error("User data retrieval failed .")
			}
			this.setState({
				user: {...resData.data.getUserAgentData},
				isOnboarded: resData.data.getUserAgentData.isOnboarded,
				isLoading: false
			})
			this.getLocation(token, resData.data.getUserAgentData.address)
		}
		fetchGraphql(query, cb, token)
	}

	getChats = (token) => {
		console.log("GET CHATS")
		const query = getConversationsQuery
		const cb = resData => {
			if (resData.errors) {
				console.log(resData.errors[0].message)
				throw new Error("Can't fetch conversations")
			}
			const chats = resData.data.conversations.map(x => ({
				name: x[0].conversationName,
				id: x[0].otherId,
				messages: [...x]
			}))
			this.setState({
				conversations: chats,
				unreadMessages: !!chats.find(x => x.messages.find(x => !x.seen && x.receiverId === parseInt(this.state.userId)))
			})
		}
		fetchGraphql(query, cb, token)
	}

	getUsedInterests = (token) => {
		console.log("GET USED INTERESTS")

		const query = usedInterestsQuery
		const cb = resData => {
			if (resData.errors) {
				throw new Error("Interests retrieval failed .")
			}
			this.setState({interests: resData.data.usedInterests})
		}
		fetchGraphql(query, cb, token)
	}

	getNotifications = (token) => {
		console.log("GET NOTIFICATIONS")
		const query = notificationsQuery
		const cb = resData => {
			if (resData.errors) {
				throw new Error(resData.errors[0].message)
			}
			const count = _.filter(resData.data.notifications, x => !x.seen).length;
			this.setState({notifications: resData.data.notifications, newNotifications: count})
		}
		fetchGraphql(query, cb, token)
	}

	getIsOnboarded = (token) => {
		console.log("GET IS ONBOARDED")
		const query = isOnboardedQuery
		const cb = (resData) => {
			if (resData.errors) {
				throw new Error("User data retrieval failed .")
			}
			if (resData.data.isOnboarded) {
				this.getUserAgentData(token)
				this.getUsedInterests(token)
				this.getNotifications(token)
				this.getChats(token)
			}
			else {
				this.setState({isLoading: false})
			}
		}
		fetchGraphql(query, cb, token)
	}

	openGeolocationDialog = (location) => {
		this.setState({suggestedLocation: location, geolocationDialogOpen: true})
	}

	closeGeolocationDialog = () => {
		this.setState({geolocationDialogOpen: false})
	}


	getLocation = (token, existingAddress) => {
		console.log("GET LOCATION")
		const openDialog = (lat, long, address) => {
			if (address !== existingAddress) {
				this.openGeolocationDialog({latitude: lat, longitude: long, address: address})
			}
			else {
				const { latitude, longitude } = this.state.user
				this.setState({geolocation: {latitude: latitude, longitude: longitude}})
			}
		}
		const getLocationFromIp = () => {
			fetch('http://www.geoplugin.net/json.gp')
				.then((res) => res.json())
				.then((data) => {
						openDialog(data.geoplugin_latitude, data.geoplugin_longitude, data.geoplugin_city + ", " + data.geoplugin_countryName)
					}
				)
				.catch((err) => console.log(err))
		}
		if (!("geolocation" in navigator)) {
			console.log("geolocation not available")
			getLocationFromIp()
		}
		navigator.geolocation.getCurrentPosition((position) => {
			const {latitude, longitude} = position.coords
			geocoder.reverseGeocode(latitude, longitude, (err, data) => {
				if (err) {
					getLocationFromIp()
				}
				else {
					let address = data.results[0].formatted_address.split(",")
					while (address.length >= 3) {
						address.shift()
					}
					openDialog(latitude, longitude, address.join())
				}
			}, {key: 'AIzaSyDhO5lFvlxnnGx_eBwAmDsagl0tE-vxE2U'})
		}, (err) => {
			console.log(err.message, ". Getting location from IP")
			getLocationFromIp()
		})
	}


	saveLocation = () => {
		this.closeGeolocationDialog()
		const {latitude, longitude, address} = this.state.suggestedLocation
		this.setState({geolocation: {latitude: latitude, longitude: longitude}})
		const query = saveLocationMutation(latitude, longitude, address)
		const cb = resData => {
			if (resData.errors) {
				throw new Error(resData.errors[0].message)
			}
			console.log(resData.data)
		}
		fetchGraphql(query, cb, this.state.token)
	}

	markNotificationsAsSeen = () => {
		const newNotifications = this.state.notifications.map(x => ({...x, seen: true}))
		this.setState({notifications: newNotifications})
		const query = markNotificationsAsSeenMutation
		const cb = resData => {
			if (resData.errors) {
				throw new Error(resData.errors[0].message)
			}
			console.log(resData.data.markNotificationsAsSeen.content)
		}
		fetchGraphql(query, cb, this.state.token)
	}

	loginHandler = (data) => {
		this.setState({
			isAuth: true,
			token: data.token,
			userId: data.userId,
			isOnboarded: data.isOnboarded,
			isLoading: false
		})
		const expiryDate = new Date(new Date().getTime() + 60 * 60 * 1000)
		localStorage.setItem('token', data.token)
		localStorage.setItem('userId', data.userId)
		localStorage.setItem('expiryDate', expiryDate.toISOString())
		this.setAutoLogout(60 * 60 * 1000)
		if (data.isOnboarded) {
			this.getUserAgentData(data.token)
			this.getUsedInterests(data.token)
			this.getNotifications(data.token)
			this.getChats(data.token)

		}
	}

	logoutHandler = () => {
		this.setState({isAuth: false, token: null});
		localStorage.removeItem('token');
		localStorage.removeItem('expiryDate');
		localStorage.removeItem('userId');
	};

	setAutoLogout = milliseconds => {
		setTimeout(this.logoutHandler, milliseconds);
	};

	toggleNotificationDrawer = () => {
		console.log("Notifications clicked")
		this.setState({notificationsOpen: !this.state.notificationsOpen})
	}

	onboardingHandler = () => {
		this.setState({isOnboarded: true})
		this.getUserAgentData(this.state.token)
		this.getUsedInterests(this.state.token)
		this.getNotifications(this.state.token)
		this.getChats(this.state.token)
	}


	resetNotifications = () => {
		this.setState({newNotifications: 0})
	}

//////////// todo: this seems weird? Why do we need it?
	checkUser() {
		if (typeof this.state.user === "undefined") {
		} else {
			return <Route path="/edit_profile"
			              render={(props) => <EditProfile {...props} user={this.state.user} token={this.state.token}
			                                              refreshUser={this.getUserAgentData}/>}/>
		}
	}

	markMessagesAsSeen = (convId) => {
		const {conversations} = this.state
		if (!conversations) {
			return
		}
		const rightConv = conversations.find(x => x.id === convId)
		if (typeof rightConv.messages.find(x => !x.seen) === 'undefined') {
			return
		}
		const newMessages = rightConv.messages.map(x => ({...x, seen: true}))
		const newConversations = conversations.map(x => x.id === convId ? {...x, messages: newMessages} : x)
		console.log("markMess", !!newConversations.find(x => x.messages.find(x => !x.seen && x.receiverId === parseInt(this.state.userId))))

		this.setState({
			conversations: newConversations,
			unreadMessages: !!newConversations.find(x => x.messages.find(x => !x.seen && x.receiverId === this.state.userId))
		})
		const query = markMessagesAsSeenMutation(convId)
		const cb = resData => {
			if (resData.errors) {
				throw new Error(resData.errors[0].message)
			}
			console.log(resData.data.markMessagesAsSeen.content)
		}
		fetchGraphql(query, cb, this.state.token)
	}

	render() {
		const hasAccess = this.state.isAuth && this.state.isOnboarded
		const {geolocationDialogOpen, suggestedLocation} = this.state
		const routeZero = () => {
			if (this.state.isAuth && !this.state.isOnboarded && !this.state.isLoading)
				return <Route path="/" render={(props) => <Onboarding token={this.state.token}
				                                                      onboardingHandler={this.onboardingHandler} {...props} />}/>
			else if (!this.state.isAuth)
				return <Route path="/" render={() => <LoginPage onLogin={this.loginHandler}/>}/>
			else
				return (
					<Route path="/" exact render={(props) => <Browse token={this.state.token} user={this.state.user}
					                                                 interests={this.state.interests}
					                                                 geolocation={this.state.geolocation}{...props} />}/>
					// 	<Route path="profile" component={UserProfile}/>
					// 	<Route path="chat" component={Chat}/>
				)
		}
		return (
			<div className={styles.app}>
				<ToastContainer/>
				<main style={{marginLeft: this.state.notificationsOpen ? 301 : 0}}
				      className={hasAccess ? styles.contentWithToolbar : styles.contentWithoutToolbar}>

					{hasAccess && <div className={styles.toolbarAndNotifications}>

						<Route
							render={(props) => <Toolbar {...props} onLogout={this.logoutHandler} user={this.state.user}
							                            onProfileClick={this.onProfileCLick}
							                            notificationsOpen={this.state.notificationsOpen}
							                            onNotificationClick={this.toggleNotificationDrawer}
							                            newNotifications={this.state.newNotifications}
							                            resetNotifications={this.resetNotifications}
							                            unread={this.state.unreadMessages}

							/>}/>
						<Route render={(props) => <NotificationsDrawer
							open={this.state.notificationsOpen}
							close={this.toggleNotificationDrawer}
							notifications={this.state.notifications}
							markNotificationsAsSeen={this.markNotificationsAsSeen}
							user={this.state.user}
							{...props}
						/>}/>
					</div>}

					<Switch> {/* with switch, the route will consider only the first match rather than cascading down!*/}
						{!this.state.isAuth && <Route path="/confirmation/:token" render={(props) => <Confirmation {...props}
						                                                                                           markLoggedIn={this.loginHandler}/>}/>}
						{!this.state.isAuth && <Route path="/reset_password/:token" component={ResetPassword}/>}
						{hasAccess && <Route path="/user_profile" component={UserProfile}/>}
						{hasAccess && this.checkUser()}
						{hasAccess && <Route path="/chat" render={(props) => <Chat {...props} token={this.state.token}
						                                                           conversations={this.state.conversations}
						                                                           markMessagesAsSeen={this.markMessagesAsSeen}
						                                                           sendReply={this.sendReply}
						/>}/>}
						{routeZero()}
					</Switch>
				</main>
				{hasAccess && this.state.suggestedLocation && <GeolocationDialog
					open={geolocationDialogOpen}
					onClose={this.closeGeolocationDialog}
					onYes={this.saveLocation}
					location={suggestedLocation}/>}
			</div>

		);
	}
}

export default compose(
	graphql(notificationSubscription, {
		options: () => {
			return ({
				variables: {
					userId: parseInt(localStorage.getItem('userId')) || 0
				},
			})
		}
	}),
	graphql(chatSubscription, {
		options: () => {
			return ({
				variables: {
					userId: parseInt(localStorage.getItem('userId')) || 0
				},
			})
		}
	}))(App)


/// direct components that are accessed through routing have access to
// special props 'history' and 'match'. Nested components don't.
// If we need the special props in other places, look up 'withRouter'

