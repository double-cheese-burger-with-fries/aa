import React, {Component} from 'react';
import styles from './FilterPanel.module.css'
import {Range} from 'rc-slider';
import 'rc-slider/assets/index.css';
import FormControl from "@material-ui/core/es/FormControl/FormControl";
import Select from "@material-ui/core/es/Select/Select";
import OutlinedInput from "@material-ui/core/es/OutlinedInput/OutlinedInput";
import MenuItem from "@material-ui/core/es/MenuItem/MenuItem";
import Checkbox from "@material-ui/core/es/Checkbox/Checkbox";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

class FilterPanel extends Component {
	state = {
		filters: {
			ageMin: 18,
			ageMax: 99,
			interests: [],
			allowBlocked: false
		},
		sortValue: 'location',
	}

	componentDidMount() {
		this.setState({filters: {...this.state.filters, ...this.props.filters}})
	}

	allowBlockedHandler = () => {
		this.setState({filters: {...this.state.filters, blocked: !this.state.filters.allowBlocked}})
		this.props.onBlockedFilterChange()
	}

	ageRangeHandler = ([min, max]) => {
		this.setState({filters: {...this.state.filters, ageMin: min, ageMax: max}})
	}

	sortingChangeHandler = ({target}) => {
		this.setState({sortValue: target.value})
		this.props.onSortChange(target.value)
	}

	interestsChangeHandler = ({target}) => {
		this.setState({ filters: {...this.state.filters, interests: target.value }})
		this.props.onFilterChange({...this.getFilters(), interests: target.value})
	}

	getFilters = () => ({
		ageMin: this.state.filters.ageMin,
		ageMax: this.state.filters.ageMax,
		interests: this.state.filters.interests
	})

	render() {
		const allInterests = this.props.interests
		const filters = this.getFilters()
		return (
			<div className={styles.component}>
				<div className={styles.filterBox}>
					<header className={styles.header}> FILTERS</header>
					<div className={styles.title}>
						<div className={styles.label}>Age range</div>
						<Range
							min={18}
							max={99}
							marks={{[filters.ageMin]: filters.ageMin, [filters.ageMax]: filters.ageMax}}
							allowCross={false}
							onChange={this.ageRangeHandler}
							trackStyle={[{backgroundColor: '#DD0E52'}]}
							onAfterChange={this.props.onFilterChange.bind(this, this.getFilters())}
							railStyle={{backgroundColor: '#aeaeae'}}
							value={[filters.ageMin, filters.ageMax]}
						/>
					</div>
					<div className={styles.title}>
						<div className={styles.label}>Interests</div>

						<FormControl className={styles.interestsFilter}>
							<Select
								multiple
								value={this.state.filters.interests}
								onChange={this.interestsChangeHandler}
								renderValue={selected => selected.join(', ')}
								MenuProps={MenuProps}
							>
								{allInterests && allInterests.map(interest => (
									<MenuItem key={interest} value={interest}>
										<Checkbox checked={this.state.filters.interests.indexOf(interest) >= 0} />
										<ListItemText primary={interest} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>
					<div className={styles.title}>
						<div className={styles.label}>See blocked users
						<Checkbox
							// className={styles.blockToggle}
							checked={this.state.filters.blocked}
							onChange={this.allowBlockedHandler}
						/>
						</div>
					</div>
				</div>


				<div className={styles.sortingBox}>
					<header className={styles.header}> SORT BY</header>
					<FormControl variant="outlined">

						<Select
							value={this.state.sortValue}
							onChange={this.sortingChangeHandler}
							input={
								<OutlinedInput
									labelWidth={0}
									name="age"
								/>
							}
						>
							<MenuItem value="location">Distance</MenuItem>
							<MenuItem value="age<">Age <em>&nbsp;(youger to older)</em></MenuItem>
							<MenuItem value="age>">Age <em>&nbsp;(older to younger)</em></MenuItem>
							<MenuItem value="interests">Interests in common</MenuItem>
						</Select>
					</FormControl>
				</div>
			</div>
		)
	}
}

export default FilterPanel
