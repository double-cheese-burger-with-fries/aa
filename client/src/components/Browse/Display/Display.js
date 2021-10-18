import React, {Component} from 'react';
import styles from './Display.module.css'
import ProfileCard from "./ProfileCard/ProfileCard";
import Route from "react-router-dom/es/Route";
import {graphql} from "react-apollo/index";
import {likeToggledSubscription} from "../../../graphql/subscriptions";


class Display extends Component {
	state = {}

	componentDidMount() {
		this.setState({profiles: this.props.profiles})
	}

	componentDidUpdate(prevProps) {
		if (this.props.profiles !== prevProps.profiles) {
			this.setState({profiles: this.props.profiles})
		}
	}

	componentWillReceiveProps({data}) {
		if (!!data && !!data.likeToggled) {
			const { value, sender } = data.likeToggled
			const newProfiles = this.state.profiles.map(x => x.id === sender ? {...x, likeFrom: value} : x )
			this.setState({ profiles: newProfiles})
		}
	}

	blockUser = (userId) => {
		const newProfiles = this.state.profiles.map(x => x.id === userId ? {...x, blocked: !x.blocked} : x)
		this.setState({profiles: newProfiles})
	}

	render() {
		const {token, allowBlocked} = this.props
		const {profiles} = this.state
		const filteredProfiles = profiles && profiles[0] && profiles.filter(x => !x.blocked || allowBlocked)

		return (
			<div className={styles.component}>
				{filteredProfiles && <div className={styles.scrolling}>
					{filteredProfiles.map((item, index) => (
						<Route
							key={`${item.firstName}+${item.lastName}+${index}`}
							render={(props) => <ProfileCard
								profile={item}
								user={this.props.user}
								token={token}
								onBlock={this.blockUser}
								{...props}
							/>}/>
					))}
				</div>}
				{filteredProfiles && <div className={styles.padding}>something</div>}
			</div>
		)
	}
}


export default (graphql(likeToggledSubscription, {
	options: () =>({
		variables: {
			userId: parseInt(localStorage.getItem('userId'))
		},
	})
})(Display))
