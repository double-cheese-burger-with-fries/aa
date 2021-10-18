import React from 'react';

import styles from './LoginDialog.module.css'
import {passwordCriteria, validator} from "../../../utils/string";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import Button from "@material-ui/core/es/Button/Button";
import TextInput from "../../UI/TextInput/TextInput";
import {loginQuery} from "../../../graphql/queries";
import {fetchGraphql} from "../../../utils/graphql";


class LoginDialog extends React.Component {
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
			password: {
				label: 'Password',
				type: 'password',
				tooltip: passwordCriteria,
				value: '',
				valid: true,
				rules: {
					minLength: 8,
					maxLength: 40,
				}
			},
		},
		loginFail: false
	};

	inputChangeHandler = (type, {target}) => {
		const sanitisedValue = target.value.trim()
		const valid = validator(target.value, this.state.inputFields[type].rules, type)
		if (this.state.inputFields[type].value !== sanitisedValue)
			this.setState({inputFields: {...this.state.inputFields, [type]: {...this.state.inputFields[type], value: sanitisedValue, valid: valid}}});
	}



	loginHandler = (authData) => {
		console.log("LOGIN HANDLER")  ////////////////////REMOVE
		const password = JSON.stringify(authData.password)
		const query = loginQuery(authData.email, password)
		const cb = resData => {
			if (resData.errors && resData.errors[0].status === 422) {
				throw new Error(
					"Validation failed."
				)
			}
			if (resData.errors) {
				throw new Error ("User login failed.")
			}
			this.props.onLogin(resData.data.login)
		}
		const errorCb = () => {
			this.setState({isAuth: false, loginFail: true})
		}
		fetchGraphql(query, cb, null, errorCb)
	}

	render() {
		const { open, onClose, loginFail, onPasswordReset } = this.props;
		const elementsArray = [];
		for (let key in this.state.inputFields) {
			elementsArray.push({
				...this.state.inputFields[key],
				id: key});
		}
		const allValid = elementsArray.every((x) => x.valid && x.value !== '')
		const login = () => this.loginHandler({email: this.state.inputFields.email.value, password: this.state.inputFields.password.value})
		return (
			<Dialog onClose={onClose} open={open}>
				<form  noValidate autoComplete="off" className={styles.form}>
					{elementsArray.map(element => 
					(
						<div key={element.id} >
							<TextInput
								label={element.label}
								type={element.type}
								value={element.value}
								style={element.style}
								placeholder={element.placeholder}
								onChange={this.inputChangeHandler.bind(this, element.id)}
								onKeyPress={e => { if (e.key === 'Enter' && allValid) { login() }}}
								error={!element.valid}
								autoComplete={element.autoComplete}
								tooltip={element.tooltip}
							/>
						</div> ))}
					{loginFail || this.state.loginFail ? (<div className={styles.errorMessage}>
							Incorrect email or password
						</div>) : null}
					<div className={styles.buttons}>
						<Button variant={allValid ? "contained" : "outlined"}
						        color="secondary"
						        onClick={allValid ? () => login() : null}>
							Login
						</Button>
					</div>
					<p className={styles.passwordReset} onClick={onPasswordReset}> Forgot your password ?</p>
				</form>
			</Dialog>
		);
	}
}

export default LoginDialog
