import React, { useState, useEffect } from 'react';
import messageService from '../../Api/MessageService.js';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next'; // Importez useTranslation

const MessageList = () => {
  const { t } = useTranslation(); // Utilisez useTranslation
  const [messages, setMessages] = useState([]);
  const userId = Cookies.get('userId');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (userId) {
          const messagesData = await messageService.getMessagesByUserId(userId);
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId]);

  const handleDeleteMessage = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('messageList.confirm_title'),
        text: t('messageList.confirm_text'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('messageList.confirm_button_yes'),
        cancelButtonText: t('messageList.confirm_button_no')
      });

      if (result.isConfirmed) {
        await messageService.deleteMessageById(id);
        setMessages(messages.filter((msg) => msg.id !== id)); // Update state after deletion
        Swal.fire(
          t('messageList.deleted_title'),
          t('messageList.deleted_text'),
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      Swal.fire(
        t('messageList.error_title'),
        t('messageList.error_text'),
        'error'
      );
    }
  };


  return (
    <div className="container mt-5">
      <h2 className="mb-4">{t('messageList.title')}</h2>
      <div className="list-group">
        {messages.map((message) => (
          <div key={message.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{message.subject}</h5>
              <p className="mb-1">{message.message}</p>
              <small className="text-muted">{t('messageList.from')}: {message.name} ({message.email})</small>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteMessage(message.id)}
              style={{ marginLeft: '10px' }}
            >
              {t('messageList.delete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;
