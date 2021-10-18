import React, {Component} from 'react';
import styles from './Bubble.module.css'

class Bubble extends Component {

	render() {
		const { content, fromYou} = this.props
		const style = {
			backgroundColor: fromYou ? '#bee3bb' : '#ffd1e3',
			alignSelf: fromYou ? 'flex-end' : 'flex-start'
		}
		return (
			<div
				className={styles.component}
				style={style}
			>
				{content}
			</div>
		)
	}
}

export default Bubble
