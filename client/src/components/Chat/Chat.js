import React, {Component} from 'react';
import ChatList from "./ChatList/ChatList";
import styles from './Chat.module.css'
import ChatBody from "./ChatBody/ChatBody";

class Chat extends Component {

	state = {}

	componentDidMount() {
		if (this.props.conversations && this.props.conversations.length > 0) {
			this.setState({currentConversation: this.props.conversations[0].name, conversations: this.props.conversations})
		}
	}

	onChatSelect = (name, id) => {
		console.log("on chat select")
		this.setState({currentConversation: name})
		setTimeout(() => {this.props.markMessagesAsSeen(id)}, 300)
	}

	componentWillReceiveProps({conversations}) {
		// if (conversations && this.state.currentConversation !== conversations[0].name)
		// 	this.setState({currentConversation: conversations[0].name})
		if (conversations && this.state.conversations !== conversations)
			this.setState({conversations: conversations}, () => {
				if (conversations && conversations.length > 0 && !this.state.currentConversation)
					this.setState({currentConversation: conversations[0].name})
			})
	}

	redirectToProfile = (id) => {
		this.props.history.push({
			pathname: `/user_profile`,
			search: '',
			state: { id: id}
		})
	}



	render() {
		const {conversations} = this.state
		const currentConversationWithContent = conversations && conversations.find(x => x.name === this.state.currentConversation)
		return (
			<div className={styles.component}>
				<ChatList
					userId={parseInt(localStorage.getItem('userId'))}
					conversations={conversations}
					onChatSelect={this.onChatSelect}
					currentConversation={this.state.currentConversation}
					redirectToProfile={this.redirectToProfile}
					markMessagesAsSeen={this.props.markMessagesAsSeen}
				/>
				<ChatBody
					userId={parseInt(localStorage.getItem('userId'))}
					sendReply={this.props.sendReply}
					currentConversation={currentConversationWithContent}
				/>
			</div>
		)
	}
}

export default Chat
