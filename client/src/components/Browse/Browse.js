import React, {Component} from 'react'
import styles from './Browse.module.css'
import FilterPanel from "./FilterPanel/FilterPanel"
import Display from "./Display/Display"
import _ from 'lodash'
import {getAge} from "../../utils/date";
import Route from "react-router-dom/es/Route";
import {matchesQuery} from './../../graphql/queries'
import {fetchGraphql} from "../../utils/graphql";
import geolib from 'geolib';

class Browse extends Component {

	state = {
		filters: {
			ageMin: 18,
			ageMax: 99,
			interests: [],
			allowBlocked: false
		},
		sortValue: "location"
	}

	componentDidMount() {
		this.getProfiles({...this.state.filters, interests: this.props.interests || []})
	}


	componentDidUpdate() {
		if (typeof this.state.matches === 'undefined') {
			this.getProfiles({...this.state.filters, interests: this.props.interests || []})
		}
		if (this.state.sortValue === "location" && this.state.geolocation !== this.props.geolocation) {
			let newMatches = this.sort(this.state.matches, "location")
			this.setState({matches: newMatches, geolocation: this.props.geolocation})
		}
	}

	getProfiles = (data) => {
		if (!this.props.user) {
			return
		}
		if (this.props.interests && this.props.interests === data.interests)
			data.interests = []
		console.log("GET PROFILES")
		const query = matchesQuery(this.props.user.gender, this.props.user.orientation, data.ageMin, data.ageMax, data.interests.map(x => `"${x}"`))
		const cb = (resData) => {
			if (resData.errors) {
				throw new Error("Profiles search failed")
			}
			const matchesWithAge = resData.data.match.map(x => ({...x, age: getAge(x.dob)}))
			const sortedMatches = this.sort(matchesWithAge, this.state.sortValue)
			this.setState({matches: sortedMatches, filters: {...data}})
		}
		fetchGraphql(query, cb, this.props.token)
	}

	sort = (array, sortValue) => {
		switch (sortValue) {
			case "age<":
				return _.orderBy(array, ['age'], ['asc'])
			case "age>":
				return _.orderBy(array, ['age'], ['desc'])
			case "location": {
				if (typeof this.props.geolocation === 'undefined')
					return array
				const {latitude, longitude} = this.props.geolocation
				const f = (x) => geolib.getDistance({latitude: x.latitude, longitude: x.longitude}, {latitude: latitude, longitude: longitude})
				return _.orderBy(array, [f], ['asc'])
			}
			case "interests":
				return _.orderBy(array, [x => _.intersection(x.interests, this.props.user.interests).length], ['desc']);
			default:
				return array
		}
	}

	toggleAllowBlocked = () => {
		this.setState({filters: {...this.state.filters, allowBlocked: !this.state.filters.allowBlocked}})
	}

	sortingChangeHandler = value => {
		console.log(value)
		let newMatches = this.sort(this.state.matches, value)
		this.setState({sortValue: value, matches: newMatches})
	}

	render() {
		const {matches} = this.state
///////////////////// todo: remove before moving to production
		matches && matches.forEach((x, index) => {
			if (matches.find((y, ind) => index > ind ? _.isEqual(y, x) : false)) {
				console.log("DUPLICATE: ", x.id)
			}
		})

		return (
			<div className={styles.component}>
				{this.props.user && <FilterPanel
					onFilterChange={this.getProfiles}
					onSortChange={this.sortingChangeHandler}
					filters={this.state.filters}
					interests={this.props.interests}
					onBlockedFilterChange={this.toggleAllowBlocked}
				/>}
				<Route render={(props) => <Display
					profiles={matches}
					user={this.props.user}
					token={this.props.token}
					allowBlocked={this.state.filters.allowBlocked}
					{...props}
				/>}/>
			</div>
		)
	}
}

export default Browse
