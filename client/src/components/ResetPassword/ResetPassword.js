import React, {Component} from 'react'
import styles from './ResetPassword.module.css'
import Button from "@material-ui/core/es/Button/Button";
import TextInput from "../UI/TextInput/TextInput";
import {passwordCriteria, validator} from "../../utils/string";
import {fetchGraphql} from "../../utils/graphql";
import {resetPasswordMutation} from "../../graphql/mutations";


class ResetPassword extends Component {


	constructor(props) {
		super(props)

		this.state = {
			reset: false,
			inputField: {
				password: {
					label: 'New Password',
					type: 'password',
					tooltip: passwordCriteria,
					placeholder: 'New Password',
					value: '',
					valid: true,
					rules: {
						minLength: 8,
						maxLength: 40,
					}
				},
				confirmPassword: {
					label: 'Password',
					type: 'password',
					tooltip: passwordCriteria,
					placeholder: 'Confirm Your Password',
					value: '',
					valid: true,
					rules: {
						minLength: 8,
						maxLength: 40,
					}
				},	
			}
		};
	}
	

	inputChangeHandler = (type, {target}) => {
		const sanitisedValue = target.value.trim()
		const valid = validator(sanitisedValue, this.state.inputField[type].rules, target.type)

		const checkConfirmationPassword = () => {
			if (type === 'confirmPassword' || type === 'password') {
				const pass2valid = (type === 'confirmPassword') ? valid : this.state.inputField.confirmPassword.valid
				const equal = this.state.inputField.password.value === this.state.inputField.confirmPassword.value
				this.setState({inputField: {...this.state.inputField, confirmPassword: {...this.state.inputField.confirmPassword, valid: pass2valid && equal}}})
			}
		}
		if (this.state.inputField[type] !== sanitisedValue) {
			this.setState({inputField: {...this.state.inputField, [type]: {...this.state.inputField[type], value: sanitisedValue, valid: valid}}}, checkConfirmationPassword);
		}
	}

	resetPassword = () => {
		console.log("RESET PASSWORD")
		//////// todo: WHY stringify the password?
		const password = JSON.stringify(this.state.inputField.password.value)
		const confirmPassword = JSON.stringify(this.state.inputField.confirmPassword.value)
		const token = this.props.location.pathname.split("/reset_password/")[1]
		const query = resetPasswordMutation(token, password, confirmPassword)
		const cb = resData => {
			if (resData.errors) {
				throw new Error(
					"Validation failed."
				)
			}
			this.setState({reset: true})
			setTimeout(() => {this.props.history.push('/')}, 2000)
		}
		fetchGraphql(query, cb)
	}

	render() {
		const elementsArray = [];
		for (let key in this.state.inputField) {
			elementsArray.push({
				...this.state.inputField[key],
				id: key
			});
		}
		const allValid = elementsArray.every((x) => x.valid && x.value !== '')
		return (
			<div className={styles.element}>
				{elementsArray.map(element =>
					(
						<div key={element.id}>
							<TextInput
								label={element.label}
								type={element.type}
								value={element.value}
								style={element.style}
								placeholder={element.placeholder}
								onChange={this.inputChangeHandler.bind(this, element.id)}
								onKeyPress={e => {
									if (e.key === 'Enter' && allValid) {
										console.log('hey')
									}
								}}
								error={!element.valid}
								autoComplete={element.autoComplete}
								tooltip={element.tooltip}
							/>
						</div>))}
				<div>
					<Button
						className={styles.button}
						variant={allValid ? "contained" : "outlined"}
						color="secondary"
						onClick={allValid ? () => this.resetPassword() : null}>
						Reset Password
					</Button>
				</div>
				<div >	
				{this.state.reset ? (<div className={styles.password}>
							Password succesfully reset
						</div>) : null}
				</div>
			</div>
		)
	}
}

export default ResetPassword