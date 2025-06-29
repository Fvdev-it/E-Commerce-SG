import React, { useEffect } from "react";
import "../css/Notification.css";

function Notification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // 3 sekunden
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-box" onClick={(e) => e.stopPropagation()}>
        <span className="notification-message"> {message}</span>
        <button className="notification-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default Notification;
