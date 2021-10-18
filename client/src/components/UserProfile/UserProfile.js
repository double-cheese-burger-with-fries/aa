import React, { Component } from 'react';
import styles from './UserProfile.module.css'
import Lightbox from 'react-images';
import { getAge } from "../../utils/date";
import LocationIcon from "@material-ui/icons/LocationOn"
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import JobIcon from "@material-ui/icons/Work"
import CakeIcon from "@material-ui/icons/Cake"
import FullHeart from '@material-ui/icons/Favorite'
import EmptyHeart from '@material-ui/icons/FavoriteBorder'
import ChatBubbleEmpty from '@material-ui/icons/ChatBubbleOutline'
import EditIcon from '@material-ui/icons/Edit'
import ChatBubbleFull from '@material-ui/icons/ChatBubbleOutline'
import Block from '@material-ui/icons/Block'
import { getUserDataQuery, relationsDataQuery } from "../../graphql/queries";
import { fetchGraphql } from "../../utils/graphql";
import { markProfileVisitedMutation, toggleBlockMutation, toggleLikeMutation, reportUser } from "../../graphql/mutations";
import { EMPTYAVATAR, HOST } from "../../constants";
import Button from '@material-ui/core/Button';
import { toast } from 'react-toastify';

// const getRandomBackground = () => {
// 	const n = Math.floor(Math.random() * 999) + 1
// 	return `https://picsum.photos/800/150/?image=${n}`
// }

class UserProfile extends Component {
	state = {
		user: {},
		authUser: {},
		likeTo: false,
		likeFrom: false,
		blockTo: false,
		blockFrom: false,
		chatStarted: false,
		isMe: false,
		report: false,
	}

	componentDidMount() {
		console.log("Component did mount")
		const token = localStorage.getItem('token')
		if (!token || typeof this.props.location.state === "undefined") {
			this.props.history.push('/')
			return
		}
		const id = this.props.location.state.id
		const isMe = this.props.location.state.me
		this.setState({ token: token, isMe: isMe }, () => {
			if (!isMe) {
				this.getUserData(token, id)
				this.getRelationsData(token, id)
				this.markProfileVisited(id, token)
			}
		})

	}

	componentDidUpdate() {
		const { user, me, id } = this.props.location.state
		if (user && me && this.state.user.id !== user.id) {
			this.setState({ user: user, isMe: true })
		}
		if (!me && id !== this.state.user.id) {
			this.getUserData(this.state.token, id)
			this.getRelationsData(this.state.token, id)
		}
	}

	markProfileVisited(id, token) {
		console.log("MARK PROFILE VISITED")
		const query = markProfileVisitedMutation(id)
		const cb = resData => {
			if (resData.errors) {
				throw new Error("Profile NOT marker as visited")
			}
		}
		fetchGraphql(query, cb, token)

	}

	getUserData = (token, id) => {
		console.log("GET USER DATA")
		const query = getUserDataQuery(id)
		const cb = resData => {
			if (resData.errors) {
				console.log(resData.errors[0].message)
				throw new Error("User data retrieval failed .")
			}
			this.setState({ user: { ...resData.data.getUserData } })
		}
		fetchGraphql(query, cb, token)
	}

	getRelationsData = (token, id) => {
		console.log("GET RELATIONS DATA")
		const query = relationsDataQuery(id)
		const cb = resData => {
			if (resData.errors) {
				throw new Error("Relations data retrieval failed .")
			}
			this.setState({ ...resData.data.relationsData })
		}
		fetchGraphql(query, cb, token)
	}

	openLightbox = (index) => {
		this.setState({ lightboxIsOpen: true, currentImage: index })
	}

	closeLightbox = () => {
		this.setState({ lightboxIsOpen: false })
	}
	gotoImage = (index) => {
		this.setState({ currentImage: index })
	}
	previousImage = () => {
		this.setState({ currentImage: this.state.currentImage - 1 })
	}
	nextImage = () => {
		this.setState({ currentImage: this.state.currentImage + 1 })
	}

	toggleLike = () => {
		const query = toggleLikeMutation(this.state.user.id, !this.state.likeTo)
		const cb = resData => {
			if (resData.errors) {
				throw new Error(resData.errors[0].message)
			}
			console.log("like toggled")
			this.setState({ likeTo: !this.state.likeTo })
		}
		fetchGraphql(query, cb, this.state.token)
	}

	toggleBlock = () => {
		const query = toggleBlockMutation(this.state.user.id, !this.state.blockTo)
		const cb = resData => {
			if (resData.errors) {
				throw new Error(resData.errors[0].message)
			}
			console.log("block toggled")
			this.setState({ blockTo: !this.state.blockTo })
		}
		fetchGraphql(query, cb, this.state.token)
	}

	renderButton = () => {
		if (this.state.isMe) {
			return this.state.isMe && <div>
				<Button variant="contained" onClick={this.onEditClick} size="small">
					<EditIcon /> Edit
				</Button>
			</div>
		}

		return <div>
			<Button variant="contained" onClick={this.onReportClick} size="small">
				<svg style={{ width: 24, height: 24 }} >
					<path fill="#000000" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
				</svg> Report profile
		</Button>
		</div>
	}

	onEditClick = () => {
		this.props.history.push('/edit_profile')
	}


	reportDialog = () => {
		return <Dialog onClose={this.closeDialog} open={this.state.report} >
			<div style={{ margin: 10 }}>Are you sure you want to report this profile ?</div>
			<Button style={{ margin: 10 }} variant={"contained"}
				color="secondary"
				onClick={this.onReportValidation}>
				Report
						</Button>
		</Dialog>
	}

	onReportClick = () => {
		this.setState({ report: true })
	}

	onReportValidation = () => {
		const query = reportUser(this.state.user.id)
		const cb = resData => {
			if (resData.errors) {
				throw new Error("Profile NOT marker as visited")
			}
			toast.success("User reported")
			this.setState({ report: false })
		}
		fetchGraphql(query, cb, this.state.token)
	}
	closeDialog = () => {
		this.setState({ report: false })
	}

	render() {
		const { firstName, lastName, dob, gender, orientation, address, interests, job, bio, profilePic, picture2, picture3, picture4, picture5 } = this.state.user
		const images = [picture2, picture3, picture4, picture5].filter(x => !!x && x !== 'undefined')
		const imagesArray = [profilePic, ...images].map(x => ({ src: x }))
		// const printableAddress = address && address.replace(/[0-9]/g, '')

		const getProfilePic = () => {
			const profileP = profilePic && profilePic.substring(0, 7) === "images/" ? `${HOST}/${profilePic}` : profilePic
			return typeof profileP !== 'undefined' ? profileP : EMPTYAVATAR
		}
		const orientations = { 'F': 'woman', 'M': 'man', 'FM': "man or a woman" }
		const preference = orientations[orientation]
		const age = dob && getAge(dob)
		const renderLikeIcon = () =>
			this.state.likeTo
				? <FullHeart onClick={this.toggleLike} color={"error"} />
				: <EmptyHeart onClick={this.toggleLike} />
		const renderBlockIcon = () =>
			<Block onClick={this.toggleBlock} color={this.state.blockTo ? "primary" : "inherit"} />
		const renderChatIcon = () =>
			this.state.chatStarted
				? <ChatBubbleFull className={styles.chat} />
				: <ChatBubbleEmpty className={styles.chat} />
		const iconStyle = { fontSize: 14, marginBottom: -2 }

		return (
			<div className={styles.component}>
				{this.reportDialog()}
				{this.state.user &&
					<div className={styles.whitePage}>
						<div className={styles.header}>
							<div className={styles.pictureBlock}>
								<img className={styles.profilePic}
									src={getProfilePic()}
									onClick={this.openLightbox.bind(this, 0)}
									alt={`${firstName}+${lastName}`}
								/>
								{!this.state.isMe ?
									<div className={styles.actionBlocks}>
										<div className={styles.iconBlock}> {renderLikeIcon()} Like</div>
										<div className={styles.iconBlock}> {renderBlockIcon()} Block</div>
										{this.state.likeTo && this.state.likeFrom && !this.state.blockTo &&
											<div className={styles.iconBlock}> {renderChatIcon()} Chat</div>}
									</div> : null}
							</div>
							<div className={styles.infoBox}>
								<div className={styles.name}>{firstName} {lastName}</div>
								<div className={styles.minorInfo}><CakeIcon style={iconStyle} /> {age} years old</div>
								<div className={styles.minorInfo}><LocationIcon style={iconStyle} /> {address}</div>
								<div className={styles.minorInfo}><JobIcon style={iconStyle} /> {job} </div>
								<div className={styles.minorInfo}><EmptyHeart style={iconStyle} /> Looking for a {preference} </div>
							</div>
							{this.renderButton()}
						</div>
						<div className={styles.body}>
							<div className={styles.title}> Bio</div>
							<div>{bio}</div>
						</div>
						<div className={styles.body}>
							<div className={styles.title}>Interests</div>
							<ul>
								{interests && interests.map(x => <li key={x}>{x}</li>)}
							</ul>
						</div>

						<div className={styles.body}>
							<div className={styles.title}> Photos</div>

							{!images.length
								? "No photos added"
								: <div className={styles.photos}>
									{images.map((x, i) =>
										<div className={styles.pic}
											style={{ backgroundImage: `url(${x})` }}
											key={i}
											onClick={this.openLightbox.bind(this, (i + 1))}
										/>
									)}
									<Lightbox
										currentImage={this.state.currentImage}
										images={imagesArray}
										isOpen={this.state.lightboxIsOpen}
										onClose={this.closeLightbox}
										onClickThumbnail={this.gotoImage}
										onClickNext={this.nextImage}
										onClickPrev={this.previousImage}
									/>
								</div>
							}
						</div>
					</div>
				}
			</div>
		)
	}
}


export default UserProfile

