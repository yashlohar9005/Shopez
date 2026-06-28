import React from 'react';
import ProfileForm from '../../components/ProfileForm';

const ProfileSettings = () => {
  return (
    <div>
      <h3 className="fw-bold mb-4">Profile Settings</h3>
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
