import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
	const [message, setMessage] = useState({
		open: false,
		title: '',
		message: '',
		type: 'info',
	});

	const showMessage = (title, messageText, type = 'info') => {
		setMessage({
			open: true,
			title,
			message: messageText,
			type,
		});
	};

	const hideMessage = () => {
		setMessage((current) => ({
			...current,
			open: false,
		}));
	};

	return (
		<MessageContext.Provider
			value={{
				message,
				showMessage,
				hideMessage,
			}}
		>
			{children}
		</MessageContext.Provider>
		);
	};

export const useMessage = () => {
	const context = useContext(MessageContext);

	if(!context){
		throw new Error('useMessage must be used inside a MessageProvider');
	}

	return context;
};