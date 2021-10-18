import React from 'react'
import styles from './OnboardingPics.module.css'
import Fab from "@material-ui/core/es/Fab/Fab";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import LinearProgress from "@material-ui/core/es/LinearProgress/LinearProgress";
import ImageUploader from 'react-images-upload';

class OnboardingPics extends React.Component {
	state = {}
///////// PROBLEM. This is called twice, therefore uploadPic is called twice.
	/// This will be fixed once we change the picture uploader
	onDrop = (pictures) => {
		this.uploadPic(pictures[0], 'profilePic')
	}
//////////////////

	uploadPic = (data, picType) => {
		const formData = new FormData()
		formData.append('image', data)
		if (this.state[`${picType}Path`]) {
			console.log("OLD PATH", this.state[`${picType}Path`])
			formData.append('oldPath', this.state[`${picType}Path`]);
		}
		fetch('http://localhost:3001/post-image', {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer ' + this.props.token,
			},
			body: formData
		})
			.then(res => res.json())
			.then(fileResData => {
				console.log(fileResData)
				this.setState({[`${picType}Path`]: fileResData.filePath, [picType]: data})
			})
			.catch(err => {
				console.log(err)
			})
	}

	componentDidMount() {
		const {profilePic, picture2, picture3, picture4, picture5} = this.props
		this.setState({
			profilePicPath: profilePic,
			picture2Path: picture2,
			picture3Path: picture3,
			picture4Path: picture4,
			picture5Path: picture5
		})
	}

	render() {
		const {previousPage, completedProgress} = this.props

		// const allValid = elementsArray.every((x) => x.valid && x.value !== '')
		const save = () => this.props.save({
			profilePic: this.state.profilePicPath,
			picture2: this.state.picture2Path,
			picture3: this.state.picture3Path,
			picture4: this.state.picture4Path,
			picture5: this.state.picture5Path
		})

		return (
			<div className={styles.component}>
				<div className={styles.upperPart}>
					<ImageUploader
						buttonText='Choose your profile pic'
						withPreview={true}
						withLabel={false}
						onChange={this.onDrop}
						imgExtension={['.jpg', '.gif', '.jpeg', '.png']}
						singleImage={true}
					/>

				</div>
				<div className={styles.navigation}>
					<div className={styles.buttons}>
						<Fab onClick={previousPage} color="secondary" variant="extended" >
							<NavigateBeforeIcon/>
						</Fab>
						<Fab onClick={save} color="secondary" variant="extended" >
							<NavigateNextIcon/>
						</Fab>
					</div>
					<LinearProgress color="primary" className={styles.progress} variant="determinate" value={completedProgress}/>
				</div>
			</ div>
		)
	}
}

export default OnboardingPics