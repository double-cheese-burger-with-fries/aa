import React from 'react'
import styles from './NotificationsDrawer.module.css'
import Notifications from "./Notifications/Notifications";
import Drawer from "@material-ui/core/es/Drawer/Drawer";
import withStyles from "@material-ui/core/es/styles/withStyles";
import Route from "react-router-dom/es/Route";

const drawerWidth = 301

const drawerStyle = theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
	},
});


const NotificationsDrawer = (props) => {
	const {open, close, notifications, user, markNotificationsAsSeen} = props
	return (
		<Drawer
			className={styles.component}
			variant="persistent"
			anchor="left"
			open={open}
			classes={{
				paper: props.classes.drawerPaper,
			}}
		>
			<Route render={(props) =>
			<Notifications
				close={close}
				notifications={notifications}
				markNotificationsAsSeen={markNotificationsAsSeen}
				user={user}
				{...props}
			/>}/>
		</Drawer>
	)
}

export default withStyles(drawerStyle, { withTheme: true })(NotificationsDrawer);
