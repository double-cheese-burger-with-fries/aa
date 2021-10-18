import React from 'react';

import styles from './PasswordDialog.module.css'
import {validator} from "../../../utils/string";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import Button from "@material-ui/core/es/Button/Button";
import TextInput from "../../UI/TextInput/TextInput";
import {passwordResetEmailMutation} from "../../../graphql/mutations";
import {fetchGraphql} from "../../../utils/graphql";
import {toast} from "react-toastify";

class PasswordDialog extends React.Component {
	state = {
		inputFields: {
			email: {
				label: 'Email',
				type: 'email',
				value: '',
				valid: true,
				style: {margin: '20px 15px 10px'},
				autoComplete: 'email',
				rules: {
					minLength: 8,
					maxLength: 40,
				}
			},
		},
		buttonDisabled: false,
	};

	inputChangeHandler = (type, {target}) => {
		const sanitisedValue = target.value.trim()
		const valid = validator(target.value, this.state.inputFields[type].rules, type)
		if (this.state.inputFields[type] !== sanitisedValue)
			this.setState({
				inputFields: {
					...this.state.inputFields,
					[type]: {...this.state.inputFields[type], value: sanitisedValue, valid: valid}
				}
			});
	}

	sendResetPasswordHandler = () => {
		console.log("RESET PASSWORD EMAIL HANDLER")
		////////////////////REMOVE
		const email = JSON.stringify(this.state.inputFields.email.value)
		const query = passwordResetEmailMutation(email)
		const cb = resData => {
			if (resData.errors) {
				throw new Error(
					"Validation failed."
				)
			}
			if (resData.errors) {
				throw new Error("Email Unknown")
			}
			console.log(resData)
			toast.success("Check your emails! We have sent you a link to reset your password", {
				autoClose: 3000
			})
			this.setState({buttonDisabled: true})
			setTimeout(this.props.onClose, 1000)
		}
		fetchGraphql(query, cb)
	}

	render() {
		const {open, onClose} = this.props;
		const element = this.state.inputFields['email']
		const allValid = (element.valid && element.value !== '')
		return (
			<Dialog open={open} onClose={onClose}>
				<div key={element.id}>
					<TextInput
						label={element.label}
						type={element.type}
						value={element.value}
						style={element.style}
						placeholder={element.placeholder}
						onChange={this.inputChangeHandler.bind(this, element.type)}
						onKeyPress={e => {
							if (e.key === 'Enter' && allValid) {
								this.sendResetPasswordHandler()
							}
						}}
						error={!element.valid}
						autoComplete={element.autoComplete}
						tooltip={element.tooltip}
					/>
				</div>
				<div className={styles.buttons}>
					<Button variant={allValid && !this.state.buttonDisabled ? "contained" : "outlined"}
					        color="secondary"
					        onClick={allValid && !this.state.buttonDisabled ? () => this.sendResetPasswordHandler() : null}>
						Reset Password
					</Button>
				</div>
			</Dialog>
		);
	}
}

export default PasswordDialog
