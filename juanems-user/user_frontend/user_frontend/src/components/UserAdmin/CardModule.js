import React from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import '../../css/UserAdmin/CardModule.css';

const CardModule = ({ title, description, isActive = false, isInvisible = false }) => {
  return (
    <div className={`card-modules ${isActive ? 'active' : ''} ${isInvisible ? 'invisible-module' : ''}`}>
      <div className='card-content'>
        <div className='icon-container'>
          <FileTextOutlined />
        </div>
      </div>
      <div className='card-content'>
        <p className={`card-heading ${isActive ? 'active' : ''}`}>{title}</p>
        <p className={`card-message ${isActive ? 'active' : ''}`}>{description}</p>
      </div>
    </div>
  );
};

export default CardModule;
