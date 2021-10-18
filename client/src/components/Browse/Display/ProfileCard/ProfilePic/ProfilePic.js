import React from 'react'
import styles from './ProfilePic.module.css'

const ProfilePic = ({src}) => (
	<div className={styles.component}>
		<img src={src} alt="MatchaLove" />
	</div>
)

export default ProfilePic