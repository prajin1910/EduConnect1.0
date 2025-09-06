import React from 'react';
import AlumniDirectoryUnified from './AlumniDirectoryUnified';

// Alumni Directory for Alumni Portal (excludes current user, shows mentoring buttons)
const AlumniDirectoryNew: React.FC = () => {
  return <AlumniDirectoryUnified showConnectButton={false} />;
};

export default AlumniDirectoryNew;