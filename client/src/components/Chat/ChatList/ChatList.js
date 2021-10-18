import React, {Component} from 'react';
import List from "@material-ui/core/es/List/List";
import ListItem from "@material-ui/core/es/ListItem/ListItem";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";
import styles from './ChatList.module.css'
import ListItemSecondaryAction from "@material-ui/core/es/ListItemSecondaryAction/ListItemSecondaryAction";
import filter from 'lodash/filter'
import Avatar from "@material-ui/core/es/Avatar/Avatar";
import ListItemAvatar from "@material-ui/core/es/ListItemAvatar/ListItemAvatar";

class ChatList extends Component {

	componentWillReceiveProps({conversations}) {
		const res = (conversations && conversations.find(x => x.name === this.props.currentConversation &&
			!!x.messages.find(x => !x.seen && x.receiverId === this.props.userId)))
		if (!!res) {
			setTimeout(() => {
				this.props.markMessagesAsSeen(res.id)
			}, 1000)
		}
	}

	render() {
		const {conversations, currentConversation, redirectToProfile, userId} = this.props
		const countUnread = (messages) => filter(messages, x => !x.seen && x.receiverId === userId).length;
		const style = (x) => ({
			borderBottom: "1px solid white",
			backgroundColor: x.name === currentConversation ? '#f2dff5' : '#f1f1f5',
			cursor: 'default'
		})

		return (
			<List className={styles.component}>
				{conversations && conversations.map((x, i) => (
					<ListItem
						button
						key={i}
						style={style(x)}
						onClick={this.props.onChatSelect.bind(this, x.name, x.id)}
					>
						<ListItemAvatar
							className={styles.avatar}
							onClick={redirectToProfile.bind(this, x.id)}
						>
							<Avatar alt={x.name} src={x.messages[0].picture}/>
						</ListItemAvatar>
						<ListItemText
							primary={x.name}
							secondary={x.messages[0].timestamp}
						/>
						<ListItemSecondaryAction>
							{countUnread(x.messages) > 0 && (<div className={styles.unreadBadge}>{countUnread(x.messages)} </div>)}
						</ListItemSecondaryAction>

					</ListItem>
				))}
			</List>
		)
	}
}

export default ChatList
