import React, {Component} from 'react';
import styles from './Messages.module.css'
import Bubble from "./Bubble/Bubble";

class Messages extends Component {

	scrollToBottom = () => {
		this.messagesEnd.scrollIntoView({ });
	}

	componentDidMount() {
		this.scrollToBottom();
	}

	componentDidUpdate() {
		this.scrollToBottom();
	}

	render() {
		const { messages } = this.props
		return (
			<div className={styles.component}>
				{messages && messages.length &&
				messages.map((x, i) => (
					<Bubble
						key={i}
						content={x.content}
						fromYou={x.senderId === this.props.userId}
					/>
				))}
				<div style={{ float:"left", clear: "both" }}
				     ref={(el) => { this.messagesEnd = el; }}>
				</div>
			</div>
		)
	}
}

export default Messages
