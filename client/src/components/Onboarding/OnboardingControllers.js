import React from 'react'
import Button from "@material-ui/core/es/Button/Button";
import styles from './OnboardingControllers.module.css';
import Fab from "@material-ui/core/es/Fab/Fab";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';


const OnboardingControllers = (props) => {
	const { nextPage, previousPage } = props
	return (
		<div className={styles.component}>
			<Fab onClick={previousPage} variant="extended">
				<NavigateBeforeIcon/>
			</Fab>
			<Fab onClick={nextPage} variant="extended">
				<NavigateNextIcon/>
			</Fab>
		</div>
	)
}

export default OnboardingControllers