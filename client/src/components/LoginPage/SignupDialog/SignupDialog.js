import React from 'react';

import styles from './SignupDialog.module.css'
import {passwordCriteria, validator} from "../../../utils/string";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import Button from "@material-ui/core/es/Button/Button";
import TextInput from "../../UI/TextInput/TextInput";
import {createUserMutation} from "../../../graphql/mutations";
import {fetchGraphql} from "../../../utils/graphql";
import {toast} from 'react-toastify';


class SignupDialog extends React.Component {

	state = {
		email: {
			label: 'Email',
			type: 'email',
			value: '',
			valid: true,
			placeholder: 'example@matcha.com',
			style: {margin: '20px 15px 10px'},
			autoComplete: 'email',
			rules: {
				minLength: 8,
				maxLength: 70,
			}
		},
		password: {
			label: 'Password',
			type: 'password',
			value: '',
			tooltip: passwordCriteria,
			valid: true,
			rules: {
				minLength: 8,
				maxLength: 40,
			}
		},
		password2: {
			label: 'Repeat password',
			type: 'password',
			value: '',
			valid: true,
			rules: {
				minLength: 8,
				maxLength: 40,
			}
		},
	};

	signupHandler = () => {
		const password = JSON.stringify(this.state.password.value)
		const query = createUserMutation(this.state.email.value, password)
		const cb = resData => {
			if (resData.errors && resData.errors[0].status === 422) {
				throw new Error(
					"Validation failed. Make sure the email address isn't used yet!"
				);
			}
			if (resData.errors) {
				throw new Error('User creation failed!');
			}
			console.log(resData)
			toast.success("Check your emails! We have sent you a link to confirm the creation of your account", {
				autoClose: 3000
			})
			this.props.onClose()
		}
		fetchGraphql(query, cb)
	}

	inputChangeHandler = (type, {target}) => {
		const sanitisedValue = target.value.trim()
		const valid = validator(sanitisedValue, this.state[type].rules, target.type)
		console.log(type)
		const checkConfirmationPassword = () => {
			if (type === 'password2' || type === 'password') {
				const pass2valid = (type === 'password2') ? valid : this.state.password2.valid
				const equal = this.state.password.value === this.state.password2.value
				this.setState({password2: {...this.state.password2, valid: pass2valid && equal}})
			}
		}
		if (this.state[type] !== sanitisedValue) {
			this.setState({[type]: {...this.state[type], value: sanitisedValue, valid: valid}}, checkConfirmationPassword);
			}
		}


	render() {
		const { open, onClose} = this.props;
		const elementsArray = [];
		for (let key in this.state) {
			elementsArray.push({
				...this.state[key],
				id: key});
		}
		const allValid = elementsArray.every((x) => x.valid && x.value !== '')
		const onClick = allValid ? this.signupHandler : null
		return (
			<Dialog onClose={onClose} open={open}>
				<form  noValidate autoComplete="on">
					{elementsArray.map(element => (
					<div key={element.id} >
						<TextInput
							label={element.label}
							style={element.style}
							type={element.type}
							value={element.value}
							onKeyPress={e => { if (e.key === 'Enter' && allValid) { this.signupHandler() }}}
							placeholder={element.placeholder}
							onChange={this.inputChangeHandler.bind(this, element.id)}
							error={!element.valid}
							autoComplete={element.autoComplete}
							tooltip={element.tooltip}
						/>
					</div> ))}
					<div className={styles.buttons}>
						<Button variant={allValid ? "contained" : "outlined"} color="secondary" onClick={onClick}>
							Sign Up
						</Button>
					</div>
				</form>
			</Dialog>
		);
	}
}

export default SignupDialog
