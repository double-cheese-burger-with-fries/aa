import React from 'react'
import TextField from "@material-ui/core/es/TextField/TextField";
import Tooltip from "@material-ui/core/es/Tooltip/Tooltip";

class TextInput extends React.Component {



	render () {
		const { label, type, value, onChange, onBlur, onFocus, error, autoComplete, placeholder, onKeyPress, style, tooltip, defaultValue, multiline, rows } = this.props
		return (
			<Tooltip title={!tooltip ? '' : tooltip}  placement="right" enterDelay={500} >
				<TextField
				// id="outlined-name"
				label={label}
				autoComplete={autoComplete}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={onChange}
				onKeyPress={onKeyPress}
				margin="normal"
				variant="outlined"
				style={style ? style : {
					margin: '10px 15px'
				}}
				defaultValue={defaultValue}
				error={error}
				multiline={multiline}
				rows={rows}
				onFocus={onFocus}
				onBlur={onBlur}
			/>
			</Tooltip>
		)
	}

}

export default TextInput