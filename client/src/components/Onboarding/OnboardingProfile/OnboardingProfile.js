import React from 'react'
import styles from './OnboardingProfile.module.css'
import TextInput from "../../UI/TextInput/TextInput";
import Fab from "@material-ui/core/es/Fab/Fab";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import LinearProgress from "@material-ui/core/es/LinearProgress/LinearProgress";
import FormSelector from "../../UI/FormSelector";
import {capitalise, sanitise, validator} from "../../../utils/string";


class OnboardingProfile extends React.Component {
	state = {
		textFields: {
			firstName: {
				label: "First name",
				value: "",
				valid: true,
				style: {margin: '10px'},
				rules: {
					minLength: 2,
					maxLength: 30,
					isAlpha: true
				}
			},
			lastName: {
				label: "Last name",
				value: "",
				valid: true,
				style: {margin: '10px'},
				rules: {
					minLength: 2,
					maxLength: 30,
					isAlpha: true
				}
			},
			dob: {
				label: "Date of birth",
				valid: true,
				defaultValue: "1990-01-01",
				value: "1990-01-01",
				type: 'date',
				rules: {
					isAfter: Date.parse("01/01/1919"),
					isBefore: Date.parse("01/01/2001")
				}
			},
		},
		gender: {
			value: "Woman"
		},
		orientation: {
			value: "Any"
		}
	}

	updateGender = (data) =>
		this.setState({gender: {value: data}})

	updateOrientation = (data) =>
		this.setState({orientation: {value: data}})

	inputChangeHandler = (type, {target}) => {
		const valid = validator(target.value, this.state.textFields[type].rules, target.type)
		if (this.state.textFields[type] !== target.value) {
			this.setState({
				textFields: {
					...this.state.textFields,
					[type]: {...this.state.textFields[type], value: target.value, valid: valid}
				}
			});
		}
		}

	componentWillMount () {
		this.setState({
			textFields: {
				firstName: {...this.state.textFields.firstName, value: this.props.firstName},
				lastName: {...this.state.textFields.lastName, value: this.props.lastName},
				dob: {...this.state.textFields.dob,  value: this.props.dob, defaultValue: this.props.dob},
			},
			gender: { value: this.props.gender},
			orientation: {value: this.props.orientation}
		})
	}

	render() {
		const elementsArray = [];
		for (let key in this.state.textFields) {
			elementsArray.push({
				...this.state.textFields[key],
				id: key
			});
		}
		const allValid = elementsArray.every((x) => x.valid && x.value !== '')
		const save = () => this.props.save({
			firstName: capitalise(sanitise(this.state.textFields.firstName.value)),
			lastName: capitalise(sanitise(this.state.textFields.lastName.value)),
			dob: this.state.textFields.dob.value,
			gender: this.state.gender.value,
			orientation: this.state.orientation.value
		})

		return (
			<div className={styles.component}>
				<div className={styles.upperPart}>
					<form noValidate autoComplete="on" className={styles.basicInfo}>
						{elementsArray.map(element => (
							<div key={element.id}>
							<TextInput
								label={element.label}
								value={element.value}
								// defaultValue={element.value}
								style={element.style}
								type={element.type}
								onChange={this.inputChangeHandler.bind(this, element.id)}
								error={!element.valid}
							/></div>))}
					</form>
					<div className={styles.gender}>
						<FormSelector options={['Woman', 'Man']} formName={"Gender"} onChange={this.updateGender} value={this.state.gender.value}/>
						<FormSelector options={['Any', 'Woman', 'Man']} formName={"Looking for"} onChange={this.updateOrientation} value={this.state.orientation.value}/>
					</div>
				</div>
				<div className={styles.navigation}>
					<div className={styles.buttons}>
						<Fab onClick={save} color="secondary" disabled={!allValid} variant="extended" >
							<NavigateNextIcon/>
						</Fab>
					</div>
					<LinearProgress color="primary" className={styles.progress} variant="determinate" value={this.props.completedProgress}/>
				</div>
			</ div>
		)
	}
}

export default OnboardingProfile