import React, {Component} from 'react'
import styles from './NavigationItems.module.css'
import Link from "react-router-dom/es/Link";
import MailIcon from '@material-ui/icons/Mail';

class navigationItems extends Component {

	onClick = () => {
		console.log("CALLED")
		this.props.history.push({
			pathname: `/user_profile`,
			search: '',
		})
	}

	render() {
		const {unread} = this.props
		return (
			<ul className={styles.navigationItems}>
				<li className={styles.item}><Link to="/">Browse</Link></li>
				<li className={styles.item}><Link to={{
					pathname: '/user_profile',
					search: '',
					state: {user: this.props.user, me: true}
				}}>Profile</Link></li>
				<li className={styles.item} >
					<Link to="/chat" >
						<div className={styles.chatText}>
							<div>Chat</div>
							{unread && <MailIcon className={styles.mailIcon}/>}
						</div>
					</Link>
				</li>
			</ul>
		)
	}
}

export default navigationItems