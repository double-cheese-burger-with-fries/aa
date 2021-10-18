import React from 'react'
import FormControlLabel from "@material-ui/core/es/FormControlLabel/FormControlLabel";
import FormLabel from "@material-ui/core/es/FormLabel/FormLabel";
import RadioGroup from "@material-ui/core/es/RadioGroup/RadioGroup";
import Radio from "@material-ui/core/es/Radio/Radio";
import FormControl from "@material-ui/core/es/FormControl/FormControl";

class FormSelector extends React.Component {
	state = {
		value: this.props.options[0],
	}

	componentWillMount () {
		this.setState({value: this.props.value})
	}
	handleChange = event => {
		this.setState({ value: event.target.value })
		this.props.onChange(event.target.value)
	}

	render() {
		const { options, formName } = this.props
		return (
			<FormControl component="fieldset" >
				<FormLabel component="legend">{formName}</FormLabel>
				<RadioGroup
					name={formName}
					value={this.state.value}
					onChange={this.handleChange}
				>
					{options.map((option) => (
						<FormControlLabel key={option} value={option} control={<Radio/>} label={option}/>
						))}
				</RadioGroup>
			</FormControl>
		)
	}
}

export default FormSelector