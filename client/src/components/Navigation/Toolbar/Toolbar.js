import React, {Component} from 'react'
import styles from './Toolbar.module.css'
import NavigationItems from "../NavigationItems/NavigationItems";
import {Route} from 'react-router-dom';
import NotificationIcon from '@material-ui/icons/Notifications';
import LogOutIcon from '@material-ui/icons/PowerSettingsNew';
import Badge from "@material-ui/core/es/Badge/Badge";

import {withStyles} from '@material-ui/core/styles';

const badgeStyle = () => ({
	badge: {
		top: -1,
		right: -8,
	}
});

class Toolbar extends Component {
	state = {newNotifications: 0}


	componentWillReceiveProps({newNotifications}) {
		if (newNotifications !== 0) {
			this.setState({newNotifications: newNotifications})
		}
	}

	notificationClicked = () => {
		this.setState({ newNotifications: 0 })
		this.props.resetNotifications()
		this.props.onNotificationClick()
	}

	render() {
		const {
			user,
			classes,
			onLogout,
			unread,
			notificationsOpen,
		} = this.props
		const {newNotifications} = this.state
		const iconColor = 1 === false ? 'white' : 'yellow'
		return (
			<header className={styles.toolbar} style={{left: notificationsOpen ? 301 : 0}}>
				{!notificationsOpen && <div style={{color: iconColor}}
				                            className={styles.notificationIcon}
				                            onClick={this.notificationClicked}
				>
					<Badge color="primary" badgeContent={newNotifications} classes={{badge: classes.badge}}
					       invisible={!newNotifications}>
						< NotificationIcon style={{fontSize: 35}}/>
					</Badge>
				</div>}

				<nav style={{flex: 1}}>
					<Route render={(props) => <NavigationItems  {...props} onLogout={onLogout} unread={unread} user={user}/>}/>
				</nav>
				<div className={styles.logoutIcon}>
					<LogOutIcon style={{fontSize: 30}} onClick={onLogout}/>
				</div>
			</header>
		)
	}
}


export default withStyles(badgeStyle)(Toolbar)