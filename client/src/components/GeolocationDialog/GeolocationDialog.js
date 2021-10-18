import React, {Component} from 'react'
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import Button from "@material-ui/core/es/Button/Button";
import styles from './GeolocationDialog.module.css'
class GeolocationDialog extends Component {

	render() {
		const {onClose, open, onYes, location} = this.props
		return (
			<Dialog onClose={onClose} open={open}>
				<div className={styles.text}>
				<div>Update your location to </div>
					<div className={styles.location}>{location.address}?</div>
				</div>
					<div className={styles.buttons}>
				<Button variant='contained' onClick={onClose}>NO</Button>
				<Button variant='contained' color='secondary' onClick={onYes}>YES</Button>
				</div>
			</Dialog>
		);
	}
}

export default GeolocationDialog
