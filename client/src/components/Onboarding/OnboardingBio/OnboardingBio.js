import React from 'react'
import styles from './OnboardingBio.module.css'
import Fab from "@material-ui/core/es/Fab/Fab";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import LinearProgress from "@material-ui/core/es/LinearProgress/LinearProgress";
import TextInput from "../../UI/TextInput/TextInput";
import {sanitise, validator} from "../../../utils/string";
import Chip from "@material-ui/core/es/Chip/Chip";
import TextField from "@material-ui/core/es/TextField/TextField";

class OnboardingBio extends React.Component {
	state = {
		job: {
			label: "Occupation",
			value: "",
			valid: true,
			rules: {
				minLength: 5,
				maxLength: 50,
				isAlpha: true
			}
		},
		bio: {
			label: "Bio",
			value: "",
			valid: true,
			rules: {
				minLength: 5,
				maxLength: 3000,
			}
		},
		currentTag: {
			value: "",
			valid: true,
			rules: {
				isAlpha: true,
				minLength: 3,
				maxLength: 20
			}
		},
		tags: [],
		interestsSelected: false
	}

	interestsFocusHandler = () => {
		this.setState({interestsSelected: true})
	}

	interestsBlurHandler = () => {
		this.setState({interestsSelected: false})
	}

	deleteTag = tag => {
		this.setState({tags: this.state.tags.filter((x) => x !== tag)})
	}

	inputChangeHandler = (type, {target}) => {
		let valid = validator(target.value, this.state[type].rules, target.type)
		if (type === 'currentTag' && this.state.tags.includes(sanitise(target.value).toLowerCase()))
			valid = false
		this.setState({[type]: {...this.state[type], value: target.value, valid: valid}});
	}

	addTag = () => {
		if (this.state.currentTag.valid && this.state.currentTag.value !== '') {
			this.setState({
				tags: [...this.state.tags, sanitise(this.state.currentTag.value).toLowerCase()],
				currentTag: {...this.state.currentTag, value: ''}
			})
			if (this.state.tags.length === 4)
				this.interestsBlurHandler()
		}
	}

	componentWillMount () {
		this.setState({
			job: {...this.state.job, value: this.props.job},
			bio: {...this.state.bio, value: this.props.bio},
			tags: this.props.tags
		})
	}

	render() {
		const allValid = this.state.job.value && this.state.job.valid && this.state.bio.value && this.state.bio.valid && this.state.tags.length
		const interestBorderStyle = this.state.interestsSelected ? { border: "2px solid #3f51b5"} : { border: "1px solid #b7b7b7"}
		const data = {
			job: sanitise(this.state.job.value),
			bio: this.state.bio.value,
			tags: this.state.tags
		}
		const saveAndSubmit = () => {
			this.props.save(data)
		}
		const saveAndPreviousPage = () => {
			this.props.tempSave(data)
			this.props.previousPage()
		}

		return (
			<div className={styles.component}>
				<div className={styles.upperPart}>
					<TextInput
						label={this.state.job.label}
						value={this.state.job.value}
						error={!this.state.job.valid}
						onChange={this.inputChangeHandler.bind(this, "job")}
					/>
					<div className={styles.interests} style={interestBorderStyle}>
						<div className={styles.interestsLabel}>Interests</div>
						<div className={styles.chips}>
							{this.state.tags.map((tag) =>
								<Chip className={styles.chip} key={tag} label={tag} color="primary"
								      onDelete={this.deleteTag.bind(this, tag)}/>
							)}
							{this.state.tags.length < 5 && <TextField
								onChange={this.inputChangeHandler.bind(this, "currentTag")}
								margin="normal"
								style={{height: '18px', width: "120px"}}
								error={!this.state.currentTag.valid}
								value={this.state.currentTag.value}
								onFocus={this.interestsFocusHandler}
								onBlur={this.interestsBlurHandler}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === 'Tab') {
										if (this.state.currentTag.value) { e.preventDefault() }
										this.addTag()
									}
								}}
							/>}
						</div>
					</div>
					<TextInput
						ref={(input) => { this.bioInpyt = input; }}
						label={this.state.bio.label}
						value={this.state.bio.value}
						error={!this.state.bio.valid}
						multiline={true}
						rows={12}
						onChange={this.inputChangeHandler.bind(this, "bio")}
					/>
				</div>
				<div className={styles.navigation}>
					<div className={styles.buttons}>
						<Fab onClick={saveAndPreviousPage} color="secondary" variant="extended">
							<NavigateBeforeIcon/>
						</Fab>
						<Fab onClick={saveAndSubmit} disabled={!allValid} color="secondary" variant="extended">
							Create your profile
						</Fab>
					</div>
					<LinearProgress color="primary" className={styles.progress} variant="determinate" value={this.props.completedProgress}/>
				</div>
			</ div>
		)
	}
}

export default OnboardingBio