import React from 'react';
import AlumniDirectoryUnified from './AlumniDirectoryUnified';

// Alumni Directory for Other Portals (includes connect button for all users)
const AlumniDirectory: React.FC = () => {
  return <AlumniDirectoryUnified showConnectButton={true} />;
};

export default AlumniDirectory;